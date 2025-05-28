// src/app/signup/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { emailVerificationSettings } from "../../firebase/config";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User signed up:", user.email);
        // If user is already signed in and verified, redirect to dashboard
        if (user.emailVerified) {
          router.push("/dashboard");
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setSuccess(false);
    setShowResend(false);
    setIsLoading(true);

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        // Send verification email with custom continue URL
        await sendEmailVerification(user, emailVerificationSettings);
        
        // Sign out the user immediately after registration
        await signOut(auth);
        
        setSuccess(true);
        setInfo("Registration successful! A verification email has been sent to your address. Please verify your email before logging in.");
        setShowResend(true);
        
        // Clear form
        setEmail("");
        setPassword("");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError("");
    setInfo("");
    setIsLoading(true);

    try {
      // Try to sign in temporarily to resend verification
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user, emailVerificationSettings);
        await signOut(auth);
        setInfo("Verification email resent successfully.");
      }
    } catch (err: any) {
      // If user already exists, that's expected
      if (err.code === 'auth/email-already-in-use') {
        setInfo("If an account with this email exists, a verification email has been sent.");
      } else {
        setError("Failed to resend verification email: " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl mb-6 text-green-300">$ register --new-user</h1>
        
        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email:</label>
              <input
                type="email"
                placeholder="user@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full bg-black border border-green-400 text-green-400 p-2 focus:outline-none focus:border-green-300 disabled:opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1">Password:</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full bg-black border border-green-400 text-green-400 p-2 focus:outline-none focus:border-green-300 disabled:opacity-50"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-green-400 text-black p-2 hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="border border-green-400 text-green-300 p-4 bg-black">
              <div className="text-green-300 mb-2">✓ Account Created Successfully</div>
              <div className="text-sm">Please check your email and verify your account before logging in.</div>
            </div>
            
            {showResend && (
              <button 
                onClick={handleResendVerification}
                disabled={isLoading}
                className="w-full bg-yellow-600 text-black p-2 hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Resending..." : "Resend Verification Email"}
              </button>
            )}
            
            <button 
              onClick={goToLogin}
              className="w-full bg-blue-600 text-white p-2 hover:bg-blue-500 transition-colors"
            >
              Go to Login
            </button>
          </div>
        )}

        {error && (
          <div className="border border-red-400 text-red-400 p-3 mt-4 bg-black">
            <div className="text-red-300 mb-1">✗ Error</div>
            <div className="text-sm">{error}</div>
          </div>
        )}

        {info && (
          <div className="border border-cyan-400 text-cyan-300 p-3 mt-4 bg-black">
            <div className="text-cyan-300 mb-1">ℹ Info</div>
            <div className="text-sm">{info}</div>
          </div>
        )}

        {!success && (
          <div className="mt-6 text-center">
            <span className="text-gray-400">Already have an account? </span>
            <button 
              onClick={goToLogin}
              className="text-green-400 hover:text-green-300 underline"
            >
              Log in here
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
