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

export default function MakeCirclePage({ navigation }) {
  const [circleName, setCircleName] = useState("");
  const [circles, setCircles] = useState([]);

  const joinCircle = async (circleId) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userData = {
        userName: user.displayName || user.email,
        adminStatus: false, // Set admin status as needed
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
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Circle Name"
        value={circleName}
        onChangeText={setCircleName}
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
          paddingLeft: 8,
        }}
      />

      <Button
        title="Join Circle"
        onPress={handleJoinCircle}
        disabled={!circleName} // Disable if any field is empty
        style={{ marginTop: 10 }}
      />

      <FlatList
        data={circles}
        renderItem={renderCircle}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        extraData={circles}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  list: { alignItems: "center" },
  circleContainer: { margin: 10, alignItems: "center" },
  circleIcon: { width: 80, height: 80 },
  circleText: { marginTop: 5, fontSize: 16 },
});
