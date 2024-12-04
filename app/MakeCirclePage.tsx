import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import { db, auth } from '@/firebase';
import { query, collection, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { useNavigation } from "@react-navigation/native";

const MakeCirclePage = () => {
  const [circleName, setCircleName] = useState('');
  const [winnerPrize, setWinnerPrize] = useState('');
  const [loserChallenge, setLoserChallenge] = useState('');
  const [duration, setDuration] = useState('');
  const navigation = useNavigation();

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

      // Generate a random number (e.g., between 100000 and 999999)
      //const randomNumber = Math.floor(Math.random() * 900000) + 100000;

      // Generate random RGB values in the pastel range (200–225)
      const r = Math.floor(Math.random() * 26) + 200; // Red component
      const g = Math.floor(Math.random() * 26) + 200; // Green component
      const b = Math.floor(Math.random() * 26) + 200; // Blue component

      // Convert RGB to Hex
      const randomColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

      // Create Circle
      const circleData = {
        circleName,
        winnerPrize,
        loserChallenge,
        duration: Number(duration),
        status: 'active',
        createdAt: Timestamp.now(),
        completionTime,
        colorCode: randomColor, // Add the random number as color code
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
        <Text style={styles.title}>Circle Info</Text>
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
      <TouchableOpacity style={styles.buttonContainer} onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/images/backarrow.png')} // Replace with your image file path
            />
      </TouchableOpacity>
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
    height: '48%',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    top: 0,
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

export default MakeCirclePage;
