"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import TerminalDisplay from "@/components/TerminalDisplay";
import { usePreferencesStore } from "@/store/preferencesStore";

export default function AuthPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  // Get preferences for styling
  const fontColor = usePreferencesStore((s) => s.fontColor);
  const fontOpacity = usePreferencesStore((s) => s.fontOpacity);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut(auth);
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const goToLogin = () => {
    router.push("/login");
  };

  const goToSignup = () => {
    router.push("/signup");
  };

  const goToDashboard = () => {
    router.push("/userdashboard");
  };

  if (isLoading) {
    return (
      <DashboardLayout
        fontColor={fontColor}
        fontOpacity={fontOpacity}
        topNavBg="#0f2124"
        topNavBgOpacity={1}
        sidebarBg="#0f2124"
        sidebarBgOpacity={1}
        terminalBg="#062c33"
        terminalBgOpacity={1}
      >
        <TerminalDisplay
          fontColor={fontColor}
          fontOpacity={fontOpacity}
          bgColor="#062c33"
          bgOpacity={1}
          title="$ auth --status"
          hideAuthPanel={true}
        >
          <div className="text-cyan-400">
            <div className="mb-4">Checking authentication status...</div>
            <div className="animate-pulse">Loading...</div>
          </div>
        </TerminalDisplay>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      fontColor={fontColor}
      fontOpacity={fontOpacity}
      topNavBg="#0f2124"
      topNavBgOpacity={1}
      sidebarBg="#0f2124"
      sidebarBgOpacity={1}
      terminalBg="#062c33"
      terminalBgOpacity={1}
    >
      <TerminalDisplay
        fontColor={fontColor}
        fontOpacity={fontOpacity}
        bgColor="#062c33"
        bgOpacity={1}
        title="$ auth --manage"
        hideAuthPanel={true}
      >
        {user ? (
          // User is logged in - show logout functionality
          <div className="space-y-6">
            <div className="border border-green-400 text-green-300 p-4 bg-black/20">
              <div className="text-green-300 mb-2">✓ Authenticated</div>
              <div className="text-sm space-y-1">
                <div><span className="text-gray-400">Email:</span> {user.email}</div>
                <div><span className="text-gray-400">UID:</span> {user.uid}</div>
                <div><span className="text-gray-400">Email Verified:</span> {user.emailVerified ? "Yes" : "No"}</div>
                <div><span className="text-gray-400">Last Sign In:</span> {user.metadata.lastSignInTime}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-cyan-400 mb-4">Authentication Actions:</div>
              
              <button
                onClick={goToDashboard}
                className="w-full bg-blue-600 text-white p-3 hover:bg-blue-500 transition-colors font-mono"
              >
                &gt; Go to Dashboard
              </button>

              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full bg-red-600 text-white p-3 hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
              >
                {isSigningOut ? "Signing out..." : "&gt; Sign Out"}
              </button>
            </div>

            {!user.emailVerified && (
              <div className="border border-yellow-400 text-yellow-300 p-4 bg-black/20">
                <div className="text-yellow-300 mb-2">⚠ Email Not Verified</div>
                <div className="text-sm">Please check your email and verify your account for full access.</div>
              </div>
            )}
          </div>
        ) : (
          // User is not logged in - show login options
          <div className="space-y-6">
            <div className="border border-red-400 text-red-300 p-4 bg-black/20">
              <div className="text-red-300 mb-2">✗ Not Authenticated</div>
              <div className="text-sm">You are not currently logged in. Please sign in or create an account.</div>
            </div>

            <div className="space-y-4">
              <div className="text-cyan-400 mb-4">Authentication Options:</div>
              
              <button
                onClick={goToLogin}
                className="w-full bg-green-600 text-white p-3 hover:bg-green-500 transition-colors font-mono"
              >
                &gt; Sign In
              </button>

              <button
                onClick={goToSignup}
                className="w-full bg-blue-600 text-white p-3 hover:bg-blue-500 transition-colors font-mono"
              >
                &gt; Create Account
              </button>
            </div>

            <div className="text-gray-400 text-sm">
              <div className="mb-2">Available commands:</div>
              <div className="space-y-1 font-mono">
                <div>&gt; auth --login    # Sign in to existing account</div>
                <div>&gt; auth --register # Create new account</div>
                <div>&gt; auth --status   # Check authentication status</div>
              </div>
            </div>
          </div>
        )}
      </TerminalDisplay>
    </DashboardLayout>
  );
} 