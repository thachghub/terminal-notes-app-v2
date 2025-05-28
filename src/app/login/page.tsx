"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signOut, sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [info, setInfo] = useState("");
  const [showResend, setShowResend] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setShowResend(false);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await signOut(auth);
        setError("Please verify your email before logging in.");
        setShowResend(true);
        return;
      }
      setSuccess(true);
      router.push("/dashboard");
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResendVerification = async () => {
    setError("");
    setInfo("");
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        setInfo("Verification email resent.");
      } catch (err: any) {
        setError("Failed to resend verification email: " + err.message);
      }
    } else {
      setError("No user is currently signed in.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Log In</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button type="submit">Log In</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {info && <p style={{ color: "green" }}>{info}</p>}
      {success && <p style={{ color: "green" }}>Login successful!</p>}
      {showResend && (
        <button onClick={handleResendVerification} style={{ marginTop: 8 }}>
          Resend Verification Email
        </button>
      )}
    </div>
  );
}
