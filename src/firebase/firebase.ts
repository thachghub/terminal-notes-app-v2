// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDROCC6RPl3xHe_E2TdbJBBYvmc1OrhSjs",
  authDomain: "hyperterminal-app.firebaseapp.com",
  projectId: "hyperterminal-app",
  storageBucket: "hyperterminal-app.firebasestorage.app",
  messagingSenderId: "991771708337",
  appId: "1:991771708337:web:178e9ae6a16924d208cb90"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
