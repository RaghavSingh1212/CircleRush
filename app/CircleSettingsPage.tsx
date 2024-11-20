import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Button,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  doc,
  collection,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "@/firebase";
import { useFocusEffect } from "@react-navigation/native";

export default function CircleSettingsPage({ route, navigation }) {
  const { circleId } = route.params;
  const [circleData, setCircleData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchCircleData = async () => {
      const docRef = doc(db, "Circles", circleId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setCircleData(data);

        setIsCompleted(data?.status === "completed");

        const userEntry = data.users.find(
          (u) => u.userName === (user?.displayName || user?.email)
        );

        setIsAdmin(userEntry?.adminStatus === true);
      }
    };

    fetchCircleData();
  }, [circleId, user]);

  const handleResetCircle = async () => {
    if (!isAdmin) {
      Alert.alert("Only admins can reset the circle.");
      return;
    }

    try {
      const newCompletionTime = new Date();
      newCompletionTime.setDate(
        newCompletionTime.getDate() + (circleData.duration || 0)
      );

      const circleRef = doc(db, "Circles", circleId);
      await updateDoc(circleRef, {
        status: "active",
        completionTime: newCompletionTime,
      });

      Alert.alert("Circle has been reset!");
      navigation.goBack(); // Navigate back to CircleDetailsPage
    } catch (error) {
      Alert.alert("Error resetting circle", error.message);
    }
  };

  const handleDeleteCircle = async () => {
    if (!isAdmin) {
      Alert.alert("Only admins can delete the circle.");
      return;
    }

    Alert.alert(
      "Delete Circle",
      "Are you sure you want to delete this circle and all its tasks?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Reference to the Tasks subcollection
              const tasksRef = collection(db, "Circles", circleId, "Tasks");
              const tasksSnap = await getDocs(tasksRef);

              // Delete each task document in the subcollection
              const deleteTaskPromises = tasksSnap.docs.map((doc) =>
                deleteDoc(doc.ref)
              );
              await Promise.all(deleteTaskPromises);

              // Delete the Circle document
              const circleRef = doc(db, "Circles", circleId);
              await deleteDoc(circleRef);

              Alert.alert("Circle and all tasks deleted successfully!");
              navigation.navigate("ViewCirclesPage"); // Navigate back to the circles list
            } catch (error) {
              Alert.alert("Error deleting circle", error.message);
            }
          },
        },
      ]
    );
  };

  if (!circleData) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Circle Settings</Text>
      {/* <Text style={styles.infoText}>Circle ID: {circleId}</Text> */}
      {isAdmin && isCompleted && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetCircle}
        >
          <Text style={styles.resetButtonText}>Reset Circle</Text>
        </TouchableOpacity>
      )}
      {isAdmin && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteCircle}
        >
          <Text style={styles.deleteButtonText}>Delete Circle</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f3f4f6" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  resetButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: "#FFA500", // Orange color for reset
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: "#FF4136",
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
