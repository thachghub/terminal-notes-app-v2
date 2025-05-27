'use client';

import DashboardLayout from '@/components/DashboardLayout';
import TerminalDisplay from '@/components/TerminalDisplay';
import CustomizationPanel from '@/components/settings/CustomizationPanel';
import { usePreferencesStore } from '@/store/preferencesStore';
import ClientHydratePreferences from '@/components/ClientHydratePreferences';

export default function SettingsClient() {
  // Only select the primitives you need!
  const fontColor = usePreferencesStore(s => s.fontColor);
  const fontOpacity = usePreferencesStore(s => s.fontOpacity);

  return (
    <>
      <ClientHydratePreferences />
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
        <TerminalDisplay title="Settings">
          <CustomizationPanel />
        </TerminalDisplay>
      </DashboardLayout>
    </>
  );
} 