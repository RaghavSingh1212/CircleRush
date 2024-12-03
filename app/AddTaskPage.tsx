import React, { useState } from "react";
import { View, TextInput, Alert, TouchableOpacity, Text, StyleSheet, Button } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db, auth } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

export default function AddTaskPage({ route }) {
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

      // Add the task to the Firestore collection
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
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Task</Text>
        <TextInput
          placeholder="Text field data"
          value={taskName}
          onChangeText={setTaskName}
          style={styles.input}
        />

        <Text style={styles.label}>Difficulty</Text>
        <TextInput
          placeholder="Text field data"
          value={points}
          onChangeText={(value) => setPoints(value.replace(/[^0-9]/g, ""))}
          keyboardType="numeric"
          style={styles.input}
        />

        <TouchableOpacity
          onPress={showDatePickerModal}
          style={[styles.actionButton, styles.enabled]}
        >
          <Text style={styles.actionButtonText}>
            {deadline ? `Deadline: ${deadline.toLocaleDateString()}` : "Select Deadline"}
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
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  formContainer: {
    justifyContent: "flex-start",
    flexGrow: 1,
    marginTop: 50,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#E3EAF4",
    backgroundColor: "#F9FCFF",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007BFF",
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  actionButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    marginBottom: 15,
  },
  enabled: {
    backgroundColor: "#95C0D7",
  },
  disabled: {
    backgroundColor: "#D6E0F0",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
