import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { db, auth } from "@/firebase";
import {
  query,
  collection,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

export default function MakeCirclePage() {
  const navigation = useNavigation();
  const [circleName, setCircleName] = useState("");
  const [circles, setCircles] = useState([]);

  const joinCircle = async (circleId) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userData = {
        userName: user.displayName || user.email,
        adminStatus: false, // Set admin status as needed
        score: 0
      };

      console.log(circleId);

      // Get a reference to the document
      const circleRef = doc(db, "Circles", circleId);

      // Update the circle name field in the document
      await updateDoc(circleRef, {
        users: arrayUnion(userData),
      });

      Alert.alert("Joined circle successfully!");
    } catch (error) {
      Alert.alert("Error joining circle", error.message);
    }
  };

  const handleJoinCircle = async () => {
    if (!circleName) {
      Alert.alert("A Circle Name is required");
      return;
    }

    try {
      const circlesRef = collection(db, "Circles");

      // Check if the circle exists at all
      const q = query(circlesRef, where("circleName", "==", circleName));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        Alert.alert("No Circle with this name exists!");
        return;
      }

      // Query Firestore to check if a Circle with the same name already exists for the user
      const circleDoc = querySnapshot.docs[0]; // Assuming circle names are unique
      const circleData = circleDoc.data();

      // Check if the user exists in the 'users' array
      const user = auth.currentUser;
      const userInCircle = circleData.users.some(
        (u) => u.userName === (user.displayName || user.email)
      );

      if (userInCircle) {
        Alert.alert("You are already a part of this circle!");
        return;
      }

      // Fetch and display circle data if it exists
      const circlesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Fetched circles data:", circlesData);

      setCircles(circlesData); // Update circles state to display in FlatList
    } catch (error) {
      Alert.alert("Error joining Circle", error.message);
    }
  };

  const renderCircle = ({ item }) => (
    <TouchableOpacity
      style={styles.circleContainer}
      onPress={() => joinCircle(item.id)}
      //   onPress={() => navigation.navigate('CircleDetails', { circleId: item.id })}
    >
      <Image
        source={require("@/assets/images/adaptive-icon.png")}
        style={styles.circleIcon}
      />
      <Text style={styles.circleText}>{item.circleName}</Text>
    </TouchableOpacity>
  );

  return (

    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Join a Circle</Text>
        <TextInput
          placeholder="Circle Name"
          value={circleName}
          onChangeText={setCircleName}
          style={styles.input}
        />
        <TouchableOpacity
          style={[styles.button, circleName ? styles.buttonActive : styles.buttonDisabled]}
          onPress={handleJoinCircle}
          disabled={!circleName}
        >
          <Text style={styles.buttonText}>Join</Text>
        </TouchableOpacity>
        <FlatList
          data={circles}
          renderItem={renderCircle}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          extraData={circles}
        />
      </View>
      <TouchableOpacity style={styles.buttonContainer} onPress={() => navigation.navigate('MakeJoinViewPage')}>
            <Image
              source={require('../assets/images/backarrow.png')} // Replace with your image file path
            />
      </TouchableOpacity>
    </View>

  );
}

const styles = StyleSheet.create({
  //container: { flex: 1, padding: 20 },
  header: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  list: { alignItems: "center" },
  circleContainer: { margin: 10, alignItems: "center" },
  circleIcon: { width: 80, height: 80 },
  circleText: { marginTop: 5, fontSize: 16 },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C4DDEB',

  },
  card: {
    width: '85%',
    height: '25%',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    top: -20,
  },
  title: {
    fontSize: 30,
    fontWeight: '400',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 40,
    // borderColor: '#CCC',
    backgroundColor: '#C4DDEB4D',
    // borderWidth: 1,
    borderRadius: 10,
    marginBottom: 25,
    paddingHorizontal: 15,
  },
  button: {
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonActive: {
    backgroundColor: '#95C0D7',
  },
  buttonDisabled: {
    backgroundColor: '#D3D3D3',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },

  buttonContainer: {
    position: 'absolute',
    top: 30,
    left: 10,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
