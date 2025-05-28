// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { ActionCodeSettings } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDROCC6RPl3xHe_E2TdbJBBYvmc1OrhSjs",
  authDomain: "hyperterminal-app.firebaseapp.com",
  projectId: "hyperterminal-app",
  storageBucket: "hyperterminal-app.firebasestorage.app",
  messagingSenderId: "991771708337",
  appId: "1:991771708337:web:178e9ae6a16924d208cb90",
};

const app = initializeApp(firebaseConfig);

// Get the current domain for action URLs
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback for server-side rendering
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

// Email verification action code settings
export const emailVerificationSettings: ActionCodeSettings = {
  url: `${getBaseURL()}/verify-email`,
  handleCodeInApp: false,
};

// Password reset action code settings
export const passwordResetSettings: ActionCodeSettings = {
  url: `${getBaseURL()}/reset-password`,
  handleCodeInApp: false,
};

export default {
  emailVerificationSettings,
  passwordResetSettings,
};
