import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { db, auth } from '@/firebase'; // Import Firestore and Auth
import { collection, addDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function make_1({ navigation }) {
  const [circleName, setCircleName] = useState('');
  const [winnerPrize, setWinnerPrize] = useState('');
  const [loserChallenge, setLoserChallenge] = useState('');
  const [duration, setDuration] = useState('');

  const handleCreateCircle = async () => {
    try {
      const user = auth.currentUser; // Current user info
      const circleData = {
        circleName,
        winnerPrize,
        loserChallenge,
        duration,
        users: [
          {
            userName: user.displayName || user.email, // User’s name or email
            adminStatus: true,
          },
        ],
      };

      // Add to 'Circles' collection
      await addDoc(collection(db, 'Circles'), circleData);
      Alert.alert('Circle created successfully!');
      navigation.navigate('AddMembers'); // Move to the Add Members screen
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
        placeholder="Duration"
        value={duration}
        onChangeText={setDuration}
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingLeft: 8 }}
      />
      <Button title="Create Circle" onPress={handleCreateCircle} style={{ marginTop: 10 }} />
    </View>
  );
}
