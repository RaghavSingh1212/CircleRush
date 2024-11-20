import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Switch,
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

export default function CircleSettingsPage({ route, navigation }) {
  const { circleId } = route.params;
  const [circleData, setCircleData] = useState(null);
  const [userNotifications, setUserNotifications] = useState({
    taskDeadline: false,
    circleUpdates: false,
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const user = auth.currentUser;

  // Fetch Circle Data
  useEffect(() => {
    const fetchCircleData = async () => {
      try {
        const docRef = doc(db, "Circles", circleId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setCircleData(data);
          setIsCompleted(data?.status === "completed");

          const userEntry = data.users.find(
            (u) => u.userName === (user?.displayName || user?.email)
          );

          if (userEntry) {
            setIsAdmin(userEntry.adminStatus);
            setUserNotifications(userEntry.notifications || userNotifications);
          } else {
            Alert.alert("Error", "User not found in this circle.");
            navigation.goBack();
          }
        } else {
          Alert.alert("Circle not found", "The circle data could not be retrieved.");
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert("Error fetching circle data", error.message);
      }
    };

    fetchCircleData();
  }, [circleId, user, navigation]);

  // Update Notification Setting
  const handleToggleNotification = async (type) => {
    try {
      const updatedNotifications = {
        ...userNotifications,
        [type]: !userNotifications[type],
      };

      setUserNotifications(updatedNotifications);

      const updatedUsers = circleData.users.map((u) => {
        if (u.userName === (user?.displayName || user?.email)) {
          return {
            ...u,
            notifications: updatedNotifications,
          };
        }
        return u;
      });

      // Update Firestore
      const circleRef = doc(db, "Circles", circleId);
      await updateDoc(circleRef, { users: updatedUsers });

      Alert.alert(
        "Success",
        `${type === "taskDeadline" ? "Task deadline" : "Circle"} notifications ${
          updatedNotifications[type] ? "enabled" : "disabled"
        }`
      );
    } catch (error) {
      Alert.alert("Error updating notification settings", error.message);
    }
  };

  // Reset Circle
  const handleResetCircle = async () => {
    if (!isAdmin) {
      Alert.alert("Unauthorized", "Only admins can reset the circle.");
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

      Alert.alert("Success", "The circle has been reset.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error resetting circle", error.message);
    }
  };

  // Delete Circle
  const handleDeleteCircle = async () => {
    if (!isAdmin) {
      Alert.alert("Unauthorized", "Only admins can delete the circle.");
      return;
    }

    Alert.alert(
      "Confirm Deletion",
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

              Alert.alert("Success", "Circle and all tasks deleted successfully.");
              navigation.navigate("ViewCirclesPage");
            } catch (error) {
              Alert.alert("Error deleting circle", error.message);
            }
          },
        },
      ]
    );
  };

  if (!circleData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Circle Settings</Text>
      <Text style={styles.infoText}>Circle ID: {circleId}</Text>
      <Text style={styles.infoText}>
        Status: {isCompleted ? "Completed" : "Active"}
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Notifications</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Task Deadline Notifications</Text>
          <Switch
            value={userNotifications.taskDeadline}
            onValueChange={() => handleToggleNotification("taskDeadline")}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Circle Notifications</Text>
          <Switch
            value={userNotifications.circleUpdates}
            onValueChange={() => handleToggleNotification("circleUpdates")}
          />
        </View>
      </View>

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
  section: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  settingText: {
    fontSize: 16,
    color: "#333",
  },
  resetButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: "#FFA500",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#555",
  },
});
