import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDPqoTl4MW1KWEEe9p2sSJeIw2qjalcpSM",
    authDomain: "famunite-f125d.firebaseapp.com",
    projectId: "famunite-f125d",
    storageBucket: "famunite-f125d.firebasestorage.app",
    messagingSenderId: "133823951422",
    appId: "1:133823951422:web:56248dd724b5bb743ad76f",
    measurementId: "G-9JPRYFNLMW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { app, firestore, auth };
