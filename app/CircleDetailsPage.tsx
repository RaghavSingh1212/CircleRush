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
import { db, auth, functions } from "@/firebase";
import { useFocusEffect } from "@react-navigation/native";
import { httpsCallable } from "firebase/functions";

export default function CircleDetailsPage({ route, navigation }) {
  const { circleId } = route.params;
  const [circleData, setCircleData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const user = auth.currentUser;

  const fetchCircleData = useCallback(async () => {
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
  }, [circleId, user]);

  const fetchTasks = useCallback(async () => {
    const tasksRef = collection(db, "Circles", circleId, "Tasks");
    const tasksSnap = await getDocs(tasksRef);

    const tasksData = tasksSnap.docs.map((doc) => ({
      ...doc.data(),
      taskId: doc.id,
    }));

    setTasks(tasksData);
  }, [circleId]);

  useFocusEffect(
    useCallback(() => {
      fetchCircleData();
      fetchTasks();
    }, [fetchCircleData, fetchTasks])
  );

  const handleCompleteTask = async (taskId) => {
    const taskRef = doc(db, "Circles", circleId, "Tasks", taskId);
    const task = tasks.find((t) => t.taskId === taskId);

    if (
      !task ||
      task.completed ||
      task.assignedUserId !== (user?.displayName || user?.email)
    ) {
      Alert.alert("You can only complete your own uncompleted tasks.");
      return;
    }

    // Update task to mark as completed
    await updateDoc(taskRef, { completed: true, completedAt: new Date() });

    // Update user score locally and in Firestore
    const updatedUsers = circleData.users.map((u) => {
      if (u.userName === (user?.displayName || user?.email)) {
        return { ...u, score: (u.score || 0) + task.points };
      }
      return u;
    });
    const circleRef = doc(db, "Circles", circleId);
    await updateDoc(circleRef, { users: updatedUsers });

    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.taskId === taskId ? { ...t, completed: true } : t
      )
    );
    setCircleData((prevData) => ({
      ...prevData,
      users: updatedUsers,
    }));

    // const sendMail = httpsCallable(functions, "sendMail");
    // const response = await sendMail({
    //   recipientEmail: user?.email, 
    //   subject: `Task ${task.taskName} has been completed!`, 
    //   text: `Congrats on completing ${task.taskName}! You have earned ${task.points} for the circle ${circleData.circleName}!`, 
    //   html: null
    // });
    // console.log(response.data.message);

    Alert.alert("Task marked as completed!");
  };

  if (!circleData) return <Text>Loading...</Text>;

  const sortedUsers = [...(circleData.users || [])].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{circleData.circleName}</Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Duration: {circleData.duration} days
        </Text>
        <Text style={styles.infoText}>
          Winner Prize: {circleData.winnerPrize}
        </Text>
        <Text style={styles.infoText}>
          Loser Challenge: {circleData.loserChallenge}
        </Text>
      </View>

      <Text style={styles.subHeader}>Users</Text>
      <FlatList
        data={sortedUsers}
        renderItem={({ item }) => (
          <View style={styles.userContainer}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.userScore}>Score: {item.score || 0}</Text>
          </View>
        )}
        keyExtractor={(item) => item.userName}
      />

      <Text style={styles.subHeader}>Tasks</Text>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View
            style={[
              styles.taskContainer,
              item.completed && styles.completedTask,
            ]}
          >
            <Text style={styles.taskName}>{item.taskName}</Text>
            <Text style={styles.taskPoints}>Points: {item.points}</Text>
            <Text style={styles.taskAssigned}>
              Assigned to: {item.assignedUserId}
            </Text>
            <Text style={styles.taskStatus}>
              Status: {item.completed ? "Completed" : "Incomplete"}
            </Text>
            {item.assignedUserId === (user?.displayName || user?.email) &&
              !item.completed && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => handleCompleteTask(item.taskId)}
                >
                  <Text style={styles.completeButtonText}>Complete Task</Text>
                </TouchableOpacity>
              )}
          </View>
        )}
        keyExtractor={(item) => item.taskId}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddTaskPage", { circleId })}
      >
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f3f4f6" },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "#e0e4e8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  userContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#ffffff",
    marginBottom: 5,
    borderRadius: 8,
  },
  userName: {
    fontSize: 16,
    color: "#444",
  },
  userScore: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },
  taskContainer: {
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginBottom: 10,
  },
  completedTask: {
    backgroundColor: "#d3eedd",
  },
  taskName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  taskPoints: {
    fontSize: 16,
    color: "#666",
  },
  taskAssigned: {
    fontSize: 16,
    color: "#666",
  },
  taskStatus: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  completeButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    alignItems: "center",
  },
  completeButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  addButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
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
  loadingText: {
    flex: 1,
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
    color: "#555",
  },
});
