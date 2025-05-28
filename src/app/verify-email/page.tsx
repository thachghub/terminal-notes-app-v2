"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User, applyActionCode, checkActionCode } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'checking' | 'success' | 'error' | 'already-verified'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleEmailVerification = async () => {
      const actionCode = searchParams.get('oobCode');
      const mode = searchParams.get('mode');

      // If there's an action code, handle the verification
      if (actionCode && mode === 'verifyEmail') {
        try {
          // Check if the action code is valid
          await checkActionCode(auth, actionCode);
          
          // Apply the email verification
          await applyActionCode(auth, actionCode);
          
          setVerificationStatus('success');
        } catch (error: any) {
          console.error('Email verification error:', error);
          setErrorMessage(error.message || 'Failed to verify email');
          setVerificationStatus('error');
        }
      } else {
        // No action code, just check current user status
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
          if (user && user.emailVerified) {
            setVerificationStatus('already-verified');
          } else if (user && !user.emailVerified) {
            setVerificationStatus('error');
            setErrorMessage('Email not yet verified');
          } else {
            setVerificationStatus('error');
            setErrorMessage('No user session found');
          }
          setIsLoading(false);
        });
        return () => unsubscribe();
      }
      
      setIsLoading(false);
    };

    handleEmailVerification();
  }, [searchParams]);

  const goToLogin = () => {
    router.push("/login");
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  const goToSignup = () => {
    router.push("/signup");
  };

  if (isLoading || verificationStatus === 'checking') {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-cyan-400">
            <div className="mb-4">$ verify --email-status</div>
            <div className="animate-pulse">Processing email verification...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl mb-6 text-green-300">$ email --verification-complete</h1>
        
        {verificationStatus === 'success' ? (
          // Email verification successful
          <div className="space-y-6">
            <div className="border border-green-400 text-green-300 p-6 bg-black/20 rounded">
              <div className="text-green-300 mb-4 text-xl">✓ Email Verification Successful</div>
              <div className="text-sm space-y-2">
                <div><span className="text-gray-400">Status:</span> <span className="text-green-400">Verified</span></div>
                <div><span className="text-gray-400">Account:</span> <span className="text-green-400">Active</span></div>
                <div><span className="text-gray-400">Access:</span> <span className="text-green-400">Full Access Granted</span></div>
              </div>
            </div>

            <div className="text-cyan-300 mb-4">
              <div className="mb-2">🎉 Your email has been successfully verified!</div>
              <div className="text-sm text-gray-400">You can now sign in with your account and access all features.</div>
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
        ) : verificationStatus === 'already-verified' ? (
          // Email already verified
          <div className="space-y-6">
            <div className="border border-blue-400 text-blue-300 p-6 bg-black/20 rounded">
              <div className="text-blue-300 mb-4 text-xl">ℹ Email Already Verified</div>
              <div className="text-sm space-y-2">
                <div><span className="text-gray-400">Email:</span> {user?.email}</div>
                <div><span className="text-gray-400">Status:</span> <span className="text-green-400">Already Verified</span></div>
                <div><span className="text-gray-400">Account:</span> <span className="text-green-400">Active</span></div>
              </div>
            </div>

            <div className="text-cyan-300 mb-4">
              <div className="mb-2">Your email is already verified.</div>
              <div className="text-sm text-gray-400">You can sign in normally or go to your dashboard.</div>
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
          </div>
        ) : (
          // Verification error or no user
          <div className="space-y-6">
            <div className="border border-red-400 text-red-300 p-6 bg-black/20 rounded">
              <div className="text-red-300 mb-4 text-xl">✗ Verification Failed</div>
              <div className="text-sm">
                {errorMessage || 'Unable to verify email. The link may be expired or invalid.'}
              </div>
            </div>

            <div className="text-cyan-300 mb-4">
              <div className="mb-2">Email verification was unsuccessful.</div>
              <div className="text-sm text-gray-400">
                Please try requesting a new verification email or contact support if the problem persists.
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={goToSignup}
                className="w-full bg-yellow-600 text-white p-3 hover:bg-yellow-500 transition-colors font-mono rounded"
              >
                &gt; Request New Verification
              </button>

              <button
                onClick={goToLogin}
                className="w-full bg-blue-600 text-white p-3 hover:bg-blue-500 transition-colors font-mono rounded"
              >
                &gt; Try Sign In
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