import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { auth } from '@/firebase';  // Import Firebase auth
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            Alert.alert('Login Successful!');
            navigation.navigate('MakeJoinViewPage'); // Adjust with your actual navigation target
        } catch (error) {
            Alert.alert('Login Failed', error.message);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            Alert.alert('Login Successful with Google!');
            navigation.navigate('MakeJoinViewPage'); // Adjust with your actual navigation target
        } catch (error) {
            Alert.alert('Google Sign-In Failed', error.message);
        }
    };
/*
    const handleCreateAccount = () => {
        // Placeholder for account creation logic
        Alert.alert('Navigate to Sign Up Page');
    };
  */

    return (
        <View style={styles.container}>
            <View style={styles.frame}>
                <View style={styles.largeCircleContainer}>
                    <Image
                        source={require('../assets/images/Ellipse1.png')}
                        style={styles.largeCircle}
                    />
                    <Text style={styles.circleTextLarge}>Rush</Text>
                </View>
                <View style={styles.smallCircleContainer}>
                    <Image
                        source={require('../assets/images/Ellipse2.png')}
                        style={styles.smallCircle}
                    />
                    <Text style={styles.circleTextSmall}>Circle</Text>
                </View>
                <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
                    <View style={styles.buttonContent}>
                        <Image
                            source={require('../assets/images/google-icon.png')}
                            style={styles.googleIcon}
                        />
                        <Text style={styles.buttonText}>Sign in with Google</Text>
                    </View>
                </TouchableOpacity>
                <View style={[styles.inputContainer, {top: 590}]}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.inputEmail}
                        placeholder="Enter your email"
                        placeholderTextColor="#A6A6A6"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>
                <View style={[styles.inputContainer, {top: 660}]}>
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
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginButtonText}>Log In</Text>
                </TouchableOpacity>
                <Text style={styles.signupText}>
                    Don’t have an account? 
                    <Text style={styles.hyperlink} onPress={() => navigation.navigate('SignupScreen')}> Create one.</Text>
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    frame: {
        width: 455,
        height: 856,
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 4,
    },
    largeCircleContainer: {
        position: 'absolute',
        top: 100,
        left: 80,
        width: 400,
        height: 400,
        alignItems: 'center',
        justifyContent: 'center',
    },
    largeCircle: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    smallCircleContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 260,
        height: 260,
        alignItems: 'center',
        justifyContent: 'center',
    },
    smallCircle: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    circleTextLarge: {
        position: 'absolute',
        color: '#FFFFFF',
        fontSize: 55,
        fontWeight: 'bold',
        top: 220,
        left: 150,
    },
    circleTextSmall: {
        position: 'absolute',
        color: '#FFFFFF',
        fontSize: 55,
        fontWeight: 'bold',
    },
    googleButton: {
        position: 'absolute',
        width: 300,
        height: 45,
        backgroundColor: '#FFFFFF',
        borderRadius: 9999,
        justifyContent: 'center',
        alignItems: 'center',
        top: 525,
        left: 65,
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    googleIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    buttonText: {
        fontSize: 16,
        color: '#000',
    },
    inputContainer: {
        position: 'absolute',
        width: 300,
        //height: 50,
        left: 65,
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
    loginButton: {
        position: 'absolute',
        width: 300,
        height: 45,
        backgroundColor: '#95C0D7',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        top: 735,
        left: 65,
        elevation: 4, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    signupText: {
        position: 'absolute',
        top: 790,
        left: 90,
        fontSize: 16,
        color: '#000',
    },
    hyperlink: {
        color: '#428CF4',
        textDecorationLine: 'underline',
    }
});

export default LoginScreen;