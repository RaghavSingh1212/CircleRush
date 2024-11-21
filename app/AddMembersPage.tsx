import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  Alert,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { db, auth, functions } from "@/firebase";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  collection,
  doc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

export default function AddMembersPage({ route, navigation }) {
  const { circleName } = route.params; // The circle ID passed from MakeCirclePage)

  const [email, setEmail] = useState("");
  const [invitedMembers, setInvitedMembers] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchInvitedMembers = async () => {
      try {
        // Query the circle document
        const circlesRef = collection(db, "Circles");
        const q = query(circlesRef, where("circleName", "==", circleName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Assuming circle names are unique, get the first matching document
          const circleDoc = querySnapshot.docs[0];
          const circleData = circleDoc.data();

          // Populate the invitedMembers list from Firestore
          setInvitedMembers(circleData.invitedMembers || []);
        } else {
          Alert.alert("Error", "Circle not found");
        }
      } catch (error) {
        Alert.alert("Error fetching invited members", error.message);
      }
    };

    fetchInvitedMembers();
  }, [circleName]);
  

  const handleSendInvitation = async () => {
    if (!email) {
      Alert.alert("Please enter an email address");
      return;
    }

    try {
      // Reference to the circle document's 'invitedMembers' field
      const circlesRef = collection(db, "Circles");
      const q = query(circlesRef, where("circleName", "==", circleName));
      const querySnapshot = await getDocs(q);

      // Assuming circle names are unique, get the first matching document
      const circleDoc = querySnapshot.docs[0];
      const circleId = circleDoc.id;
      const circleRef = doc(db, "Circles", circleId);

      const circleData = circleDoc.data();
      const alreadyInvited = circleData.invitedMembers?.some(
        (member) => member.email === email
      );

      if (alreadyInvited) {
        Alert.alert(
          "Member Already Invited",
          `${email} has already been invited.`
        );
        return;
      }

      // Add the invited email to 'invitedMembers' array in Firestore
      await updateDoc(circleRef, {
        invitedMembers: arrayUnion({ email, invitedAt: new Date() }),
      });

      console.log("Reached");

      const sendMail = httpsCallable(functions, "sendMail");
      const response = await sendMail({
        recipientEmail: email,
        subject: `Join the Circle!`,
        text: `You have been invited to join the circle ${circleName} by ${
          user?.displayName || user?.email
        }! Download the app and join the Circle now!`,
        html: `You have been invited to join the circle ${circleName} by ${
          user?.displayName || user?.email
        }! Download the app and join the Circle now!`,
      });
      // console.log(response.data.message);

      setInvitedMembers((prev) => [...prev, email]); // Update local state to show in list
      setEmail(""); // Clear the input field

      Alert.alert(`Invitation sent to ${email}!`);
    } catch (error) {
      Alert.alert("Error sending invitation", error.message);
      console.log(error);
    }
  };

  const handleDone = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "MakeJoinViewPage" }],
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Invite Members</Text>

      <TextInput
        placeholder="Enter email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
          paddingLeft: 8,
        }}
      />
      <Button
        title="Send Invitation"
        onPress={handleSendInvitation}
        disabled={!email}
      />

      <Text style={{ fontSize: 18, marginTop: 30 }}>Invited Members:</Text>
      {/* <FlatList
        data={invitedMembers}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Text style={{ fontSize: 16 }}>{item}</Text>}
      /> */}
      <FlatList
        data={invitedMembers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.memberContainer}>
            <Text style={styles.memberText}>{item.email}</Text>
            <Text style={styles.dateText}>
              Invited At: {item.invitedAt?.toDate
                ? item.invitedAt.toDate().toLocaleString()
                : "Unknown"}
            </Text>
          </View>
        )}
      />

      <Button title="Done" onPress={handleDone} style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  memberContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
  },
  memberText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 14,
    color: "gray",
  },
});