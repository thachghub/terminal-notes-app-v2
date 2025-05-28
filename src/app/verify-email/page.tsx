"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const goToLogin = () => {
    router.push("/login");
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-cyan-400">
            <div className="mb-4">$ verify --status</div>
            <div className="animate-pulse">Checking verification status...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl mb-6 text-green-300">$ email --verify-status</h1>
        
        {user && user.emailVerified ? (
          // Email is verified
          <div className="space-y-6">
            <div className="border border-green-400 text-green-300 p-6 bg-black/20 rounded">
              <div className="text-green-300 mb-4 text-xl">✓ Email Verification Successful</div>
              <div className="text-sm space-y-2">
                <div><span className="text-gray-400">Email:</span> {user.email}</div>
                <div><span className="text-gray-400">Status:</span> <span className="text-green-400">Verified</span></div>
                <div><span className="text-gray-400">Account:</span> <span className="text-green-400">Active</span></div>
              </div>
            </div>

            <div className="text-cyan-300 mb-4">
              <div className="mb-2">Your email has been successfully verified!</div>
              <div className="text-sm text-gray-400">You can now sign in with your new account and access all features.</div>
            </div>

            <div className="space-y-4">
              <button
                onClick={goToDashboard}
                className="w-full bg-green-600 text-white p-3 hover:bg-green-500 transition-colors font-mono rounded"
              >
                &gt; Go to Dashboard
              </button>

              <button
                onClick={goToLogin}
                className="w-full bg-blue-600 text-white p-3 hover:bg-blue-500 transition-colors font-mono rounded"
              >
                &gt; Sign In
              </button>
            </div>

            <div className="text-gray-400 text-sm mt-6">
              <div className="mb-2">Terminal Commands:</div>
              <div className="space-y-1 font-mono text-xs">
                <div>&gt; auth --login      # Sign in to your account</div>
                <div>&gt; dashboard --open # Access your dashboard</div>
                <div>&gt; help --auth     # View authentication help</div>
              </div>
            </div>
          </div>
        ) : user && !user.emailVerified ? (
          // User exists but email not verified
          <div className="space-y-6">
            <div className="border border-yellow-400 text-yellow-300 p-6 bg-black/20 rounded">
              <div className="text-yellow-300 mb-4 text-xl">⚠ Email Verification Pending</div>
              <div className="text-sm space-y-2">
                <div><span className="text-gray-400">Email:</span> {user.email}</div>
                <div><span className="text-gray-400">Status:</span> <span className="text-yellow-400">Pending Verification</span></div>
                <div><span className="text-gray-400">Account:</span> <span className="text-yellow-400">Limited Access</span></div>
              </div>
            </div>

            <div className="text-cyan-300 mb-4">
              <div className="mb-2">Please check your email and click the verification link.</div>
              <div className="text-sm text-gray-400">
                If you don't see the email, check your spam folder or try signing up again to resend the verification email.
              </div>
            </div>

            <button
              onClick={goToLogin}
              className="w-full bg-blue-600 text-white p-3 hover:bg-blue-500 transition-colors font-mono rounded"
            >
              &gt; Go to Sign In
            </button>
          </div>
        ) : (
          // No user signed in
          <div className="space-y-6">
            <div className="border border-red-400 text-red-300 p-6 bg-black/20 rounded">
              <div className="text-red-300 mb-4 text-xl">✗ No Active Session</div>
              <div className="text-sm">
                No user session detected. Please sign in or create an account.
              </div>
            </div>

            <div className="text-cyan-300 mb-4">
              <div className="mb-2">Email verification requires an active account.</div>
              <div className="text-sm text-gray-400">
                Please sign in to your account or create a new one to verify your email.
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={goToLogin}
                className="w-full bg-green-600 text-white p-3 hover:bg-green-500 transition-colors font-mono rounded"
              >
                &gt; Sign In
              </button>

              <button
                onClick={() => router.push("/signup")}
                className="w-full bg-blue-600 text-white p-3 hover:bg-blue-500 transition-colors font-mono rounded"
              >
                &gt; Create Account
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button 
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-green-300 underline text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
} 