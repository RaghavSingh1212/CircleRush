import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import { PieChart } from "react-native-svg-charts"; // Import PieChart
import { doc, collection, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { db, auth, functions } from "@/firebase";
import { useFocusEffect } from "@react-navigation/native";
import { httpsCallable } from "firebase/functions";

export default function CircleDetailsPage({ route, navigation }) {
  console.log("route", route);
  const { circleId } = route.params;
  const [circleData, setCircleData] = useState(null);
  const [tasks, setTasks] = useState([]);
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

    await updateDoc(taskRef, { completed: true, completedAt: new Date() });

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

    const notifyOnTaskCompletion = httpsCallable(
      functions,
      "notifyOnTaskCompletion"
    );
    await notifyOnTaskCompletion({
      circleData: circleData,
      taskData: task,
    });

    Alert.alert("Task marked as completed!");
  };

  if (!circleData) return <Text>Loading...</Text>;

  const sortedUsers = [...(circleData.users || [])].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  // Prepare data for PieChart
  const pieData = sortedUsers.map((user, index) => ({
    key: user.userName,
    value: user.score || 0,
    svg: {
      fill:
        index === 0
          ? "#FFA6A6" // Light Red for 1st
          : index === 1
          ? "#FFD9B3" // Light Orange for 2nd
          : index === 2
          ? "#FFF5B3" // Light Yellow for 3rd
          : "#E4F2F8", // Light Blue for others
    },
    arc: { outerRadius: "100%", innerRadius: "0%" },
  }));

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

      {/* Add Pie Chart Section */}
      <Text style={styles.subHeader}>Score Distribution</Text>
      <View style={styles.chartContainer}>
        <PieChart style={styles.pieChart} data={pieData} />
        <Text style={styles.pieCenterText}>Total</Text>
      </View>

      {/* Users List */}
      <Text style={styles.subHeader}>Users</Text>
      <FlatList
        data={sortedUsers}
        contentContainerStyle={styles.userListContainer}
        renderItem={({ item, index }) => {
          let backgroundColor;

          if (index === 0) {
            backgroundColor = "#FFA6A6";
          } else if (index === 1) {
            backgroundColor = "#FFD9B3";
          } else if (index === 2) {
            backgroundColor = "#FFF5B3";
          } else {
            backgroundColor = "#E4F2F8";
          }

          return (
            <View style={[styles.userContainer, { backgroundColor }]}>
              <Text style={styles.userName}>{item.userName}</Text>
              <Text style={styles.userScore}>Score: {item.score || 0}</Text>
            </View>
          );
        }}
        keyExtractor={(item) => item.userName}
        style={styles.userList}
      />

      <Text style={styles.taskHeader}>Tasks</Text>
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
            <Text style={styles.taskDetails}>Points: {item.points}</Text>
            <Text style={styles.taskDetails}>
              Assigned to: {item.assignedUserId}
            </Text>
            {item.deadline ? (
              <Text style={styles.taskDetails}>
                Deadline:{" "}
                {new Date(item.deadline.seconds * 1000).toLocaleDateString()}
              </Text>
            ) : (
              <Text style={styles.taskDetails}>Deadline: No deadline</Text>
            )}
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
  container: { flex: 1, padding: 20, backgroundColor: "white" },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "#CDE4EE",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 10,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  pieChart: {
    height: 200,
    width: 200,
  },
  pieCenterText: {
    position: "absolute",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  userList: {
    height: 350,
    marginBottom: 10,
    width: "100%",
  },
  userListContainer: {
    flexGrow: 1,
    paddingHorizontal: 15,
    width: "100%",
  },
  userContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    width: "100%",
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
    backgroundColor: "#E4F2F8",
    borderRadius: 8,
    marginBottom: 20,
  },
  completedTask: {
    backgroundColor: "#d3eedd",
  },
  taskName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  taskDetails: {
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
    backgroundColor: "#429A46",
    borderRadius: 15,
    alignItems: "center",
  },
  completeButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  addButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: "#95C0D7",
    borderRadius: 25,
    alignItems: "center",
  },
  addButtonText: {
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
