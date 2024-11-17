import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, FlatList, Alert, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { db, auth, functions } from '@/firebase';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { collection, doc, updateDoc, arrayUnion, query, where, getDoc, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

export default function AddMembersPage({ route, navigation }) {
  const { circleName } = route.params; // The circle ID passed from MakeCirclePage
  const [email, setEmail] = useState('');
  const [invitedMembers, setInvitedMembers] = useState([]);

  const handleSendInvitation = async () => {
    if (!email) {
      Alert.alert('Please enter an email address');
      return;
    }

    try {
      // Reference to the circle document's 'invitedMembers' field
      const circlesRef = collection(db, 'Circles');
      const q = query(circlesRef, where('circleName', '==', circleName));
      const querySnapshot = await getDocs(q);

      // Assuming circle names are unique, get the first matching document
      const circleDoc = querySnapshot.docs[0];
      const circleId = circleDoc.id;
      const circleRef = doc(db, 'Circles', circleId);

      // Add the invited email to 'invitedMembers' array in Firestore
      await updateDoc(circleRef, {
        invitedMembers: arrayUnion({ email, invitedAt: new Date() }),
      });

      console.log("Reached");

      const testFunction = httpsCallable(functions, 'helloWorld');
      await testFunction();

      // const sendMailgunEmail = httpsCallable(functions, 'sendMailgunEmail');


      // console.log("reached2");
      // await sendMailgunEmail({
      //   toEmails: email,
      //   subject: `You've been invited to join ${circleId}!`,
      //   text: `You've been invited to join the circle "${circleId}". Open the app to join!`,
      // });

      setInvitedMembers((prev) => [...prev, email]); // Update local state to show in list
      setEmail(''); // Clear the input field

      Alert.alert(`Invitation sent to ${email}!`);
    } catch (error) {
      Alert.alert('Error sending invitation', error.message);
    }
  };

  const handleDone = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'ViewCirclesPage' }],
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
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingLeft: 8 }}
      />
      <Button title="Send Invitation" onPress={handleSendInvitation} disabled={!email} />

      <Text style={{ fontSize: 18, marginTop: 30 }}>Invited Members:</Text>
      <FlatList
        data={invitedMembers}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Text style={{ fontSize: 16 }}>{item}</Text>}
      />

<Button title="Done" onPress={handleDone} style={{ marginTop: 20 }} />
    </View>
  );
}
