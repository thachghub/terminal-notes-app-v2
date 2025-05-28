"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut, sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { emailVerificationSettings } from "../../firebase/config";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [info, setInfo] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState(0);
  const router = useRouter();

  // Welcome message typing effect
  useEffect(() => {
    if (showWelcome && welcomeStep < 4) {
      const timer = setTimeout(() => {
        setWelcomeStep(prev => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    } else if (showWelcome && welcomeStep === 4) {
      // After welcome message is complete, wait 20 seconds then auto-close
      const timer = setTimeout(() => {
        handleCloseWelcome();
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome, welcomeStep]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    setWelcomeStep(0);
    router.push("/dashboard");
    window.location.reload();
  };

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
      
      // Show welcome message
      setTimeout(() => {
        setSuccess(false);
        setShowWelcome(true);
        setWelcomeStep(0);
      }, 1000);
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
        await sendEmailVerification(auth.currentUser, emailVerificationSettings);
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
      {/* Welcome Message - Fixed at Top */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4"
            aria-label="Welcome Message"
          >
            <div className="border border-green-400 bg-black/95 backdrop-blur-sm p-6 rounded-lg shadow-2xl">
              <div className="space-y-2 font-mono">
                <div className="flex justify-between items-center">
                  <div className="text-green-400 text-lg">$ system --welcome</div>
                  <button
                    onClick={handleCloseWelcome}
                    className="text-gray-400 hover:text-white transition-colors px-2 py-1 text-sm border border-gray-600 hover:border-gray-400 rounded"
                    aria-label="Close welcome message"
                  >
                    close
                  </button>
                </div>
                <div className="text-cyan-300">
                  {welcomeStep >= 1 && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-green-400">✓</span>
                      <span>Authentication successful</span>
                    </motion.div>
                  )}
                  {welcomeStep >= 2 && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 mt-1"
                    >
                      <span className="text-green-400">✓</span>
                      <span>Session initialized</span>
                    </motion.div>
                  )}
                  {welcomeStep >= 3 && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 mt-1"
                    >
                      <span className="text-green-400">✓</span>
                      <span>Terminal access granted</span>
                    </motion.div>
                  )}
                </div>
                {welcomeStep >= 4 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-yellow-300 text-center"
                  >
                    <div className="text-lg">Welcome to the Terminal</div>
                    <div className="text-sm mt-1">Have a nice day! 🚀</div>
                    <div className="mt-3 text-gray-400 text-xs">
                      Auto-redirecting in 20 seconds...
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
