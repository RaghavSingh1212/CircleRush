import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { db, auth } from '@/firebase';
import { query, collection, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';

const MakeCirclePage = ({ navigation }) => {
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

      // Check if Circle already exists
      const circlesRef = collection(db, 'Circles');
      const q = query(
        circlesRef,
        where('circleName', '==', circleName),
        where('users', 'array-contains', {
          userName: user.displayName || user.email,
          adminStatus: true,
        })
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Alert.alert('A Circle with this name already exists!');
        return;
      }

      const now = new Date();
      const completionTime = Timestamp.fromDate(
        new Date(now.getTime() + Number(duration) * 24 * 60 * 60 * 1000) // duration in days
      );

      // Create Circle
      const circleData = {
        circleName,
        winnerPrize,
        loserChallenge,
        duration: Number(duration),
        status: 'active',
        createdAt: Timestamp.now(),
        completionTime,
        users: [
          {
            userName: user.displayName || user.email,
            adminStatus: true,
            score: 0,
          },
        ],
      };

      await addDoc(circlesRef, circleData);
      Alert.alert('Circle created successfully!');
      navigation.navigate('AddMembers', { circleName });
    } catch (error) {
      Alert.alert('Error creating Circle', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Name your Circle</Text>
        <TextInput
          placeholder="Enter Circle Name"
          value={circleName}
          onChangeText={setCircleName}
          style={styles.input}
        />
        <TextInput
          placeholder="Winner Prize"
          value={winnerPrize}
          onChangeText={setWinnerPrize}
          style={styles.input}
        />
        <TextInput
          placeholder="Loser Challenge"
          value={loserChallenge}
          onChangeText={setLoserChallenge}
          style={styles.input}
        />
        <TextInput
          placeholder="Duration (in days)"
          value={duration}
          onChangeText={(value) => setDuration(value.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          style={styles.input}
        />
        <TouchableOpacity
          style={[styles.button, circleName && winnerPrize && loserChallenge && duration ? styles.buttonActive : styles.buttonDisabled]}
          onPress={handleCreateCircle}
          disabled={!circleName || !winnerPrize || !loserChallenge || !duration}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C4DDEB',

  },
  card: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    // borderColor: '#CCC',
    backgroundColor: "#F9FCFF",
    // borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default MakeCirclePage;
