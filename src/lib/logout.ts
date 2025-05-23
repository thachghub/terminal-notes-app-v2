// src/lib/logout.ts
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

export async function logout() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Logout failed:", err);
  }
}
