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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setShowResend(false);
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError("");
    setInfo("");
    setIsLoading(true);

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
    setIsLoading(false);
  };

  const goToSignup = () => {
    router.push("/signup");
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl mb-6 text-green-300">$ login --user</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
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
            {isLoading ? "Logging In..." : "Log In"}
          </button>
        </form>

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

        {success && (
          <div className="border border-green-400 text-green-300 p-3 mt-4 bg-black">
            <div className="text-green-300 mb-1">✓ Success</div>
            <div className="text-sm">Login successful! Redirecting...</div>
          </div>
        )}

        {showResend && (
          <button 
            onClick={handleResendVerification}
            disabled={isLoading}
            className="w-full mt-4 bg-yellow-600 text-black p-2 hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Resending..." : "Resend Verification Email"}
          </button>
        )}

        <div className="mt-6 text-center">
          <span className="text-gray-400">Don't have an account? </span>
          <button 
            onClick={goToSignup}
            className="text-green-400 hover:text-green-300 underline"
          >
            Sign up here
          </button>
        </div>
      </div>
    </div>
  );
}
