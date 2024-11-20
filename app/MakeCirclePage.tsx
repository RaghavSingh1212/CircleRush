import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { db, auth } from '@/firebase';
import { query, collection, where, getDocs, addDoc, doc, setDoc, Timestamp  } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function MakeCirclePage({ navigation }) {
  const [circleName, setCircleName] = useState('');
  const [winnerPrize, setWinnerPrize] = useState('');
  const [loserChallenge, setLoserChallenge] = useState('');
  const [duration, setDuration] = useState('');

  const handleCreateCircle = async () => {
    if (!circleName || !winnerPrize || !loserChallenge || !duration) {
      Alert.alert('All fields are required!');
      return;
    }
  
    try {
      const user = auth.currentUser;
  
      // Query Firestore to check if a Circle with the same name already exists for the user
      const circlesRef = collection(db, 'Circles');
      const q = query(circlesRef, where('circleName', '==', circleName), where('users', 'array-contains', { userName: user.displayName || user.email, adminStatus: true }));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        Alert.alert('A Circle with this name already exists!');
        return;
      }

      const now = new Date();
      const completionTime = Timestamp.fromDate(
        new Date(now.getTime() + Number(duration) * 24 * 60 * 60 * 1000) // duration in days
        // new Date(now.getTime() + 2 * 60 * 1000) // 2 minute completion time
      );
  
      // If no duplicate found, proceed to create the Circle
      const circleData = {
        circleName,
        winnerPrize,
        loserChallenge,
        duration: Number(duration),
        status: "active",
        createdAt: Timestamp.now(),
        completionTime: completionTime,
        users: [
          {
            userName: user.displayName || user.email,
            adminStatus: true,
            score: 0
          },
        ],
        tasks: []
      };
  
      await addDoc(circlesRef, circleData);
      Alert.alert('Circle created successfully!');
      navigation.navigate('AddMembers', { circleName });
    } catch (error) {
      Alert.alert('Error creating Circle', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Circle Name"
        value={circleName}
        onChangeText={setCircleName}
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingLeft: 8 }}
      />
      <TextInput
        placeholder="Winner Prize"
        value={winnerPrize}
        onChangeText={setWinnerPrize}
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingLeft: 8 }}
      />
      <TextInput
        placeholder="Loser Challenge"
        value={loserChallenge}
        onChangeText={setLoserChallenge}
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingLeft: 8 }}
      />
      <TextInput
        placeholder="Duration (in days)"
        value={duration}
        onChangeText={(value) => setDuration(value.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingLeft: 8 }}
      />
      <Button
        title="Create Circle"
        onPress={handleCreateCircle}
        disabled={!circleName || !winnerPrize || !loserChallenge || !duration} // Disable if any field is empty
        style={{ marginTop: 10 }}
      />
    </View>
  );
}
