import React, { useState } from 'react';
import {StyleSheet, View, Text, TextInput, TouchableOpacity, Button, Image, Alert } from 'react-native';
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
    <View style={styles.container}>
      <View style={styles.frame}>
        <View style={styles.Rectangle2Container}>
          <Image
              source={require('../assets/images/Rectangle2.png')}
              style={styles.Rectangle2}
          />
          <Text style={styles.rectTextLarge}>Get Started</Text>
        </View>
        <View style={styles.Rectangle1Container}>
          <Image
              source={require('../assets/images/Rectangle1.png')}
              style={styles.Rectangle1}
          />
          <View style={[styles.inputContainer, {top: 120}]}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                  style={styles.inputEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#A6A6A6"
                  value={email}
                  onChangeText={setEmail}
              />
          </View>
          <View style={[styles.inputContainer, {top: 190}]}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                  style={styles.inputPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#A6A6A6"
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
              />
          </View>
          <TouchableOpacity style={styles.createButton} onPress={handleSignup}>
                    <Text style={styles.createButtonText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonContainer} onPress={() => navigation.navigate('LoginScreen')}>
            <Image
              source={require('../assets/images/backarrow.png')} // Replace with your image file path
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#C4DDEB',
  },

  frame: {
    width: 455,
    height: 856,
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 1,
    backgroundColor: '#C4DDEB',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 4,
},

Rectangle2Container: {
  position: 'absolute',
  top: -100,
  left: 0,
  width: 395,
  height: 414,
  alignItems: 'center',
  justifyContent: 'center',
},

Rectangle2: {
  width: '100%',
  height: '100%',
  resizeMode: 'contain',
},

rectTextLarge: {
  position: 'absolute',
  color: '#FFFFFF',
  fontSize: 40,
  fontWeight: 'medium',
  alignItems: 'center',
  top: 230,
  //left: 160,
},

Rectangle1Container: {
  position: 'absolute',
  top: 130,
  left: 7,
  width: 380,
  height: 434,
  alignItems: 'center',
  justifyContent: 'center',
},

Rectangle1: {
  width: '90%',
  height: '100%',
  resizeMode: 'contain',
},

inputContainer: {
  position: 'absolute',
  width: 300,
  left: 40,
},

label: {
  color: '#000',
  fontSize: 16,
  marginBottom: 5,
},

inputEmail: {
  height: 35,
  backgroundColor: '#C4DDEB4D',
  borderRadius: 4,
  padding: 10,
},

inputPassword: {
  height: 35,
  backgroundColor: '#C4DDEB4D',
  borderRadius: 4,
  padding: 10,
  secureTextEntry: true,
},

createButton: {
  position: 'absolute',
  width: 300,
  height: 45,
  backgroundColor: '#95C0D7',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 15,
  top: 270,
  left: 40,
  elevation: 4, // Shadow for Android
  shadowColor: '#000', // Shadow for iOS
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
},

createButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
}, 

buttonContainer: {
  position: 'absolute',
  top: -100,
  left: 0,
  width: 100,
  height: 100,
  alignItems: 'center',
  justifyContent: 'center',
},
});

//export default SignupScreen;
