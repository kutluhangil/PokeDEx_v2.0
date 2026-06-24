import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA_aPgZNguAPmB5hjwVCzxXGdd4ciqejK0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pokedex-v2-kutluhangil.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pokedex-v2-kutluhangil",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pokedex-v2-kutluhangil.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "989124999551",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:989124999551:web:02e4537575bd69b947c24a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
