"use client";

import DashboardLayout from "@/components/DashboardLayout";
import TerminalDisplay from "@/components/TerminalDisplay";
import { usePreferencesStore } from "@/store/preferencesStore";

export default function DashboardPage() {
  const fontColor = usePreferencesStore((s) => s.fontColor);
  const fontOpacity = usePreferencesStore((s) => s.fontOpacity);

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
      <TerminalDisplay />
    </DashboardLayout>
  );
}
