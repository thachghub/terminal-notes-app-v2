"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import TerminalDisplay from "@/components/TerminalDisplay";
import { usePreferencesStore } from "@/store/preferencesStore";

export default function UserDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Get preferences for styling
  const fontColor = usePreferencesStore((s) => s.fontColor);
  const fontOpacity = usePreferencesStore((s) => s.fontOpacity);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setUser(user);
      } else if (user && !user.emailVerified) {
        // Redirect to verification page if email not verified
        router.push("/verify-email");
        return;
      } else {
        // Redirect to main dashboard if not authenticated
        router.push("/dashboard");
        return;
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

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
          title="$ loading --user-session"
          hideAuthPanel={true}
        >
          <div className="text-cyan-400">
            <div className="mb-4">Initializing user session...</div>
            <div className="animate-pulse">Loading dashboard...</div>
          </div>
        </TerminalDisplay>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
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
        title="$ user --dashboard"
        hideAuthPanel={true}
      >
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="border border-green-400 text-green-300 p-6 bg-black/20 rounded">
            <div className="text-green-300 mb-4 text-xl">✓ Welcome to Hyper Terminal</div>
            <div className="text-sm space-y-2">
              <div><span className="text-gray-400">User:</span> {user.email}</div>
              <div><span className="text-gray-400">Status:</span> <span className="text-green-400">Authenticated</span></div>
              <div><span className="text-gray-400">Session:</span> <span className="text-green-400">Active</span></div>
              <div><span className="text-gray-400">Last Login:</span> {user.metadata.lastSignInTime}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="text-cyan-400 mb-4 text-lg">Quick Actions:</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push("/notes")}
                className="border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 transition-colors p-4 text-left"
              >
                <div className="text-lg mb-2">&gt; New Note</div>
                <div className="text-sm text-gray-400">Create a new terminal note</div>
              </button>

              <button
                onClick={() => router.push("/notes/list")}
                className="border border-blue-500 text-blue-500 hover:bg-blue-500/10 transition-colors p-4 text-left"
              >
                <div className="text-lg mb-2">&gt; View Notes</div>
                <div className="text-sm text-gray-400">Browse your saved notes</div>
              </button>

              <button
                onClick={() => router.push("/logs")}
                className="border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 transition-colors p-4 text-left"
              >
                <div className="text-lg mb-2">&gt; Log Entry</div>
                <div className="text-sm text-gray-400">Add a new log entry</div>
              </button>

              <button
                onClick={() => router.push("/settings")}
                className="border border-purple-500 text-purple-500 hover:bg-purple-500/10 transition-colors p-4 text-left"
              >
                <div className="text-lg mb-2">&gt; Settings</div>
                <div className="text-sm text-gray-400">Customize your terminal</div>
              </button>
            </div>
          </div>

          {/* Terminal Commands Help */}
          <div className="border border-gray-600 text-gray-300 p-4 bg-black/10 rounded">
            <div className="text-gray-300 mb-3 text-lg">Available Commands:</div>
            <div className="space-y-1 font-mono text-sm">
              <div><span className="text-cyan-400">&gt; notes --new</span> <span className="text-gray-500"># Create a new note</span></div>
              <div><span className="text-cyan-400">&gt; notes --list</span> <span className="text-gray-500"># View all notes</span></div>
              <div><span className="text-cyan-400">&gt; logs --add</span> <span className="text-gray-500"># Add log entry</span></div>
              <div><span className="text-cyan-400">&gt; settings --open</span> <span className="text-gray-500"># Open settings</span></div>
              <div><span className="text-cyan-400">&gt; auth --logout</span> <span className="text-gray-500"># Sign out</span></div>
              <div><span className="text-cyan-400">&gt; help --all</span> <span className="text-gray-500"># Show all commands</span></div>
            </div>
          </div>

          {/* Recent Activity Placeholder */}
          <div className="border border-gray-600 text-gray-300 p-4 bg-black/10 rounded">
            <div className="text-gray-300 mb-3 text-lg">Recent Activity:</div>
            <div className="text-sm text-gray-400">
              <div className="mb-2">No recent activity to display.</div>
              <div>Start by creating your first note or log entry!</div>
            </div>
          </div>
        </div>
      </TerminalDisplay>
    </DashboardLayout>
  );
} 