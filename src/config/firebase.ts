// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC5sUekxpZ9zbt9i4kGVZ-JNmbm1WpE4w8",
    authDomain: "sih-2024-6ebfe.firebaseapp.com",
    projectId: "sih-2024-6ebfe",
    storageBucket: "sih-2024-6ebfe.appspot.com",
    messagingSenderId: "1079111705083",
    appId: "1:1079111705083:web:f2992dc3e2c6d4a124eb5e",
    measurementId: "G-KMBMGD7MPX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, db };