import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
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

  // Function to generate a consistent color for each user
  const generateColor = (identifier) => {
    let hash = 0;

    for (let i = 0; i < identifier.length; i++) {
      hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Map the hash to the 175-200 range for RGB values
    const r = (hash % 56) + 150; // Ensure values are between 175–200
    const g = ((hash >> 8) % 56) + 150; // Use bit-shifting to vary values
    const b = ((hash >> 16) % 56) + 150;

    // Convert to hex format
    const toHex = (value) => value.toString(16).padStart(2, "0");

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

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
      fill: generateColor(user.userName), // Use consistent color for PieChart
    },
    arc: { outerRadius: "100%", innerRadius: "0%" },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{circleData.circleName}</Text>
      <View style={[styles.infoBox, { backgroundColor: `${circleData.colorCode}80` }]}>
        <Text style={styles.infoText}>
          Duration: {circleData.duration} day(s)
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
      </View>

      {/* Users List */}
      <Text style={styles.subHeader2}>Users</Text>
      <FlatList
        data={sortedUsers}
        contentContainerStyle={styles.userListContainer}
        renderItem={({ item }) => (
          <View
            style={[
              styles.userContainer,
              { backgroundColor: generateColor(item.userName) }, // Use consistent color for user background
            ]}
          >
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.userScore}>Score: {item.score || 0}</Text>
          </View>
        )}
        keyExtractor={(item) => item.userName}
        style={styles.userList}
      />

      <Text style={styles.subHeader3}>Tasks</Text>
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
        style={styles.addTaskButton} 
        onPress={() => navigation.navigate("AddTaskPage", { circleId })}
        >
          <Text style={styles.addTaskButtonText}>Add Task</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonContainer} onPress={() => navigation.navigate('ViewCirclesPage')}>
          <Image
            source={require('../assets/images/backarrow.png')} // Replace with your image file path
          />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingsContainer} onPress={() => navigation.navigate("CircleSettingsPage", { circleId })}>
          <Image
            source={require('../assets/images/settings.png')} // Replace with your image file path
          />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    marginBottom: 30,
    backgroundColor: "white" 
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 40,
    textAlign: "center",
    top: 70,
  },
  infoBox: {
    //backgroundColor: "#CDE4EE",
    padding: 6,
    borderRadius: 10,
    marginTop: 40,
    marginBottom: 0,
    marginLeft: 5,
    //top: 70,
    //left: 27,
    width: 340,
  },
  infoText: {
    fontSize: 13,
    color: "#333",
    marginBottom: 5,
    fontWeight: "normal",
    textAlign: "center",
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginTop: 20,
    marginBottom: 15,
  },
  subHeader2: {
    fontSize: 18,
    fontWeight: "bold",
    //textAlign: "center",
    color: "#333",
    marginTop: 10,
    marginBottom: 20,
    marginLeft: 10,
  },
  subHeader3: {
    fontSize: 18,
    fontWeight: "bold",
    //textAlign: "center",
    color: "#333",
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  pieChart: {
    height: 170,
    width: 170,
  },
  pieCenterText: {
    position: "absolute",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  userList: {
    height: 190,
    marginTop: -10,
    marginBottom: 0,
    width: "100%",
  },
  userListContainer: {
    flexGrow: 1,
    paddingHorizontal: 5,
    width: "100%",
  },
  userContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    marginBottom: 5,
    width: "100%",
  },
  userName: {
    fontSize: 14,
    color: "#111",
  },
  userScore: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111",
  },
  taskContainer: {
    padding: 15,
    backgroundColor: "#E4F2F8",
    borderRadius: 8,
    marginBottom: 5,
    //marginTop: 5,
  },
  completedTask: {
    backgroundColor: "#d3eedd",
  },
  taskName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  taskDetails: {
    fontSize: 14,
    color: "#666",
  },
  taskStatus: {
    fontSize: 14,
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
  addTaskButton: {
    //position: 'absolute',
    width: 300,
    height: 45,
    backgroundColor: '#95C0D7',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    top: 10,
    left: 28,
    elevation: 4, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addTaskButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
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
  buttonContainer: {
    position: 'absolute',
    top: 30,
    left: 0,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsContainer: {
    position: 'absolute',
    top: 25,
    left: 285,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
