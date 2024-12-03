import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { db, auth, functions } from "@/firebase";
import { collection, doc, updateDoc, arrayUnion, query, where, getDocs } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

export default function AddMembersPage({ route, navigation }) {
  const { circleName } = route.params; // The circle ID passed from MakeCirclePage
  const [email, setEmail] = useState("");
  const [invitedMembers, setInvitedMembers] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchInvitedMembers = async () => {
      try {
        const circlesRef = collection(db, "Circles");
        const q = query(circlesRef, where("circleName", "==", circleName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const circleDoc = querySnapshot.docs[0];
          const circleData = circleDoc.data();
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
      const circlesRef = collection(db, "Circles");
      const q = query(circlesRef, where("circleName", "==", circleName));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Error", "Circle not found");
        return;
      }

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

      const newMember = { email, invitedAt: new Date() };
      await updateDoc(circleRef, {
        invitedMembers: arrayUnion(newMember),
      });

      const sendMail = httpsCallable(functions, "sendMail");
      await sendMail({
        recipientEmail: email,
        subject: `Join the Circle!`,
        text: `You have been invited to join the circle ${circleName} by ${
          user?.displayName || user?.email
        }! Download the app and join the Circle now!`,
      });

      setInvitedMembers((prev) => [...prev, newMember]);
      setEmail("");
      Alert.alert(`Invitation sent to ${email}!`);
    } catch (error) {
      Alert.alert("Error sending invitation", error.message);
    }
  };

  const handleDone = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "MakeJoinViewPage" }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Invite Members</Text>
        <TextInput
          placeholder="Enter email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <TouchableOpacity
          style={[
            styles.button,
            email ? styles.buttonActive : styles.buttonDisabled,
          ]}
          onPress={handleSendInvitation}
          disabled={!email}
        >
          <Text style={styles.buttonText}>Send Invitation</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Invited Members:</Text>
        <FlatList
          data={invitedMembers}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.memberContainer}>
              <Text style={styles.memberText}>{item.email}</Text>
              <Text style={styles.dateText}>
                Invited At:{" "}
                {item.invitedAt?.toDate
                  ? item.invitedAt.toDate().toLocaleString()
                  : "Unknown"}
              </Text>
            </View>
          )}
        />
      </View>

      <TouchableOpacity style={[styles.button, styles.buttonActive]} onPress={handleDone}>
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    top: 0,
    backgroundColor: "#C4DDEB66",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    height: 50,
    // borderColor: "#CCC",
    backgroundColor: '#C4DDEB4D',
    // borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonActive: {
    backgroundColor: "#95C0D7",
  },
  buttonDisabled: {
    backgroundColor: "#D3D3D3",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  memberContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
    paddingVertical: 10,
  },
  memberText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 14,
    color: "#777",
  },
});
