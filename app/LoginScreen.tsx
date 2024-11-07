import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { auth } from '@/firebase';  // Import Firebase auth
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();  // Access navigation

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Login Successful!');
      // Navigate to the MakeJoin page
      navigation.navigate('MakeJoinViewPage');
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      Alert.alert('Login Successful with Google!');
      // Navigate to the MakeJoin page
      navigation.navigate('MakeJoinViewPage');
    } catch (error) {
      Alert.alert('Google Sign-In Failed', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>CircleRush Login</Text>

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

      <Button title="Login" onPress={handleLogin} />

      <View style={{ marginVertical: 10 }}>
        <Button title="Sign in with Google" onPress={handleGoogleSignIn} color="blue" />
      </View>

      {/* <Button title="Create Account" onPress={() => Alert.alert('Navigate to Sign Up Page')} /> */}
      <Button title="Create Account" onPress={() => navigation.navigate('SignupScreen')} />
    </View>
  );
}
