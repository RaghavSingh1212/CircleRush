// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider  } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDgkIW1yIo9zM1EVWlkbVtASFOm7ac0Cc0",
    authDomain: "circlerush-1cb6f.firebaseapp.com",
    projectId: "circlerush-1cb6f",
    storageBucket: "circlerush-1cb6f.appspot.com",
    messagingSenderId: "387238791973",
    appId: "1:387238791973:web:25bc4bd965b2c6ef6ea8cc",
    measurementId: "G-E4KPZGDGNL"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();


export {
  db, auth, app // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  , firebaseConfig, googleProvider
};
