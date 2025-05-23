// src/firebase/config.ts
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDROCC6RPl3xHe_E2TdbJBBYvmc1OrhSjs",
  authDomain: "hyperterminal-app.firebaseapp.com",
  projectId: "hyperterminal-app",
  storageBucket: "hyperterminal-app.firebasestorage.app",
  messagingSenderId: "991771708337",
  appId: "1:991771708337:web:178e9ae6a16924d208cb90",
};

const app = initializeApp(firebaseConfig);

export default app;
