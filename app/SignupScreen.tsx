import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { db, auth } from '@/firebase';  // Import Firebase auth
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { query, collection, where, getDocs, addDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();  // Access navigation

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);

      const userData = {
        email: email
      };
      
      const usersRef = collection(db, 'Users');
      await addDoc(usersRef, userData);
      Alert.alert('Sign up Successful!');
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
    }
  };


  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>CircleRush Signup</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingLeft: 8 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingLeft: 8 }}
      />

      <Button title="Create Account" onPress={handleSignup} />

      {/* <Button title="Create Account" onPress={() => Alert.alert('Navigate to Sign Up Page')} /> */}
    </View>
  );
}
