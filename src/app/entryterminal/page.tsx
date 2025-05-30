"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import TerminalDisplay from "@/components/TerminalDisplay";
import EntryHistory from "@/components/EntryHistory";
import { usePreferencesStore } from "@/store/preferencesStore";
import { useTranslation } from '@/hooks/useTranslation';

export default function EntryTerminalPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Get preferences for styling
  const fontColor = usePreferencesStore((s) => s.fontColor);
  const fontOpacity = usePreferencesStore((s) => s.fontOpacity);

  const { t } = useTranslation();

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
          title={t('entryTerminalTitle')}
          subtitle={t('entryTerminalSubtitle')}
          hideAuthPanel={true}
        >
          <div className="text-cyan-400">
            <div className="mb-4">{t('initializing_entry_terminal')}</div>
            <div className="animate-pulse">{t('loading_interface')}</div>
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
        title={t('entryTerminalTitle')}
        subtitle={t('entryTerminalSubtitle')}
        hideAuthPanel={true}
      >
        {/* Pure Terminal Interface */}
        <EntryHistory />
      </TerminalDisplay>
    </DashboardLayout>
  );
} 