import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Button, Alert } from "react-native";
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { useFocusEffect } from "@react-navigation/native";

export default function CircleDetailsPage({ route, navigation }) {
  const { circleId } = route.params;
  const [circleData, setCircleData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const user = auth.currentUser;


  const fetchCircleData = useCallback(async () => {
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
  }, [circleId, user]);

  useFocusEffect(
    useCallback(() => {
      fetchCircleData();
    }, [fetchCircleData])
  );

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

  const handleCompleteTask = async (taskIndex) => {
    const updatedTasks = [...circleData.tasks];
    const task = updatedTasks[taskIndex];

    // Check if the current user is the assigned user and task is not completed
    if (task.assignedUserId !== (user?.displayName || user?.email) || task.completed) {
      Alert.alert("You can only complete your own uncompleted tasks.");
      return;
    }

    task.completed = true;

    const updatedUsers = circleData.users.map((u) => {
      if (u.userName === (user?.displayName || user?.email)) {
        return { ...u, score: (u.score || 0) + task.points };
      }
      return u;
    });

    // Update Firestore
    const circleRef = doc(db, "Circles", circleId);
    await updateDoc(circleRef, { tasks: updatedTasks });

    // Update local state
    setCircleData((prevData) => ({
      ...prevData,
      tasks: updatedTasks,
      users: updatedUsers,
    }));

    Alert.alert("Task marked as completed!");
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
        renderItem={({ item }) => (
          <Text>{item.userName} - Score: {item.score || 0}</Text>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <Text style={styles.subHeader}>Tasks:</Text>
      <FlatList
        data={circleData.tasks}
        renderItem={({ item, index }) => (
          <View style={styles.taskContainer}>
            <Text style={styles.taskName}>{item.taskName}</Text>
            <Text>Points: {item.points}</Text>
            <Text>Assigned to: {item.assignedUserId}</Text>
            <Text>Status: {item.completed ? "Completed" : "Incomplete"}</Text>
            {item.assignedUserId === (user?.displayName || user?.email) && !item.completed && (
              <Button
                title="Complete Task"
                onPress={() => handleCompleteTask(index)}
              />
            )}
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      <Button
        title="Add Task"
        onPress={() =>
          navigation.navigate("AddTaskPage", { circleId: circleId })
        }
        style={{ marginTop: 10 }}
      />
      {isAdmin && (
        <Button
          title="Delete Circle"
          onPress={handleDeleteCircle}
          style={{ marginTop: 10 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, marginBottom: 10 },
  subHeader: { fontSize: 20, marginTop: 20, marginBottom: 10 },
  taskContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  taskName: { fontWeight: "bold" },
});
