import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { db, auth } from "@/firebase";
import {
  query,
  collection,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

export default function AddTaskPage({ route, navigation }) {
  const { circleId } = route.params; // Retrieve circleId from navigation route params
  const [taskName, setTaskName] = useState("");
  const [points, setPoints] = useState("");

  const handleAddTask = async () => {
    if (!taskName || !points) {
      Alert.alert("Task name and points are required!");
      return;
    }

    try {
      const user = auth.currentUser;

      // Reference to the circle document
      const circleRef = doc(db, "Circles", circleId);

      // Task data to add to the tasks array
      const taskData = {
        taskName,
        points: Number(points),
        assignedUserId: (user?.displayName || user?.email), // Only this user can complete it
        completedAt: null,
        completed: false
      };

      // Use arrayUnion to add the task to the tasks array in the specified circle
      await updateDoc(circleRef, {
        tasks: arrayUnion(taskData),
      });

      Alert.alert("Task added successfully!");
      navigation.goBack(); // Navigate back to the circle details or tasks list page
    } catch (error) {
      Alert.alert("Error adding task", error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Task Name"
        value={taskName}
        onChangeText={setTaskName}
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
          paddingLeft: 8,
        }}
      />
      <TextInput
        placeholder="Points"
        value={points}
        onChangeText={(value) => setPoints(value.replace(/[^0-9]/g, ""))}
        keyboardType="numeric"
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
          paddingLeft: 8,
        }}
      />
      <Button
        title="Add Task"
        onPress={handleAddTask}
        disabled={!taskName || !points} // Disable if any field is empty
        style={{ marginTop: 10 }}
      />
    </View>
  );
}
