import React, { useState } from "react";
import { View, TextInput, Button, Alert, TouchableOpacity, Text } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db, auth } from "@/firebase";
import {
  query,
  collection,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

export default function AddTaskPage({ route, navigation }) {
  const { circleId } = route.params; // Retrieve circleId from navigation route params
  const [taskName, setTaskName] = useState("");
  const [points, setPoints] = useState("");
  const [deadline, setDeadline] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  

  const handleAddTask = async () => {
    if (!taskName || !points) {
      Alert.alert("Task name and points are required!");
      return;
    }

    try {
      const user = auth.currentUser;

      // Reference to the circle document
      const tasksRef = collection(db, "Circles", circleId, "Tasks");

      // Task data to add to the tasks array
      const taskData = {
        taskName,
        points: Number(points),
        assignedUserId: user?.displayName || user?.email,
        completedAt: null,
        completed: false,
        deadline: deadline, // Save the selected deadline
      };

      // Use arrayUnion to add the task to the tasks array in the specified circle
      await addDoc(tasksRef, taskData);

      Alert.alert("Task added successfully!");
      navigation.goBack(); // Navigate back to the circle details or tasks list page
    } catch (error) {
      Alert.alert("Error adding task", error.message);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false); // Close the date picker
    if (selectedDate) {
      setDeadline(selectedDate); // Update the deadline state
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
      <TouchableOpacity
        onPress={showDatePickerModal}
        style={{
          padding: 10,
          backgroundColor: "#007BFF",
          borderRadius: 5,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          {deadline
            ? `Deadline: ${deadline.toLocaleDateString()}`
            : "Select Deadline"}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={deadline || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <Button
        title="Add Task"
        onPress={handleAddTask}
        disabled={!taskName || !points} // Disable if any field is empty
        style={{ marginTop: 10 }}
      />
    </View>
  );
}