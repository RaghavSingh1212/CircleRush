import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Button, Alert } from "react-native";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/firebase";

export default function CircleDetailsPage({ route, navigation }) {
  const { circleId } = route.params;
  const [circleData, setCircleData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchCircleData = async () => {
      const docRef = doc(db, "Circles", circleId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setCircleData(data);

        const userEntry = data.users.find(
          (u) => u.userName === (user?.displayName || user?.email)
        );

        // Update `isAdmin` state based on the user’s `adminStatus`
        setIsAdmin(userEntry?.adminStatus === true);
      }
    };

    fetchCircleData();
  }, [circleId, user]);

  const handleDeleteCircle = async () => {
    Alert.alert(
      "Delete Circle",
      "Are you sure you want to delete this circle?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Reference to the circle document
              const docRef = doc(db, "Circles", circleId);

              // Delete the circle document
              await deleteDoc(docRef);

              Alert.alert("Circle deleted successfully!");
              navigation.goBack(); // Navigate back after deletion
            } catch (error) {
              Alert.alert("Error deleting circle", error.message);
            }
          },
        },
      ]
    );
  };

  if (!circleData) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{circleData.circleName}</Text>
      <Text>Duration: {circleData.duration} days</Text>
      <Text>Winner Prize: {circleData.winnerPrize}</Text>
      <Text>Loser Challenge: {circleData.loserChallenge}</Text>
      <Text>Users:</Text>
      <FlatList
        data={circleData.users}
        renderItem={({ item }) => <Text>{item.userName}</Text>}
        keyExtractor={(item) => item.id}
      />
      {isAdmin && (
        <Button
          title="Delete Circle"
          onPress={handleDeleteCircle}
          style={{ marginTop: 10 }}
        />
      )}

      {/* Display more circle details as needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, marginBottom: 20 },
});
