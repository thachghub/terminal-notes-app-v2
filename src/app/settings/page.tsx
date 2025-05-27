// src/app/settings/page.tsx
'use client';

import DashboardLayout from '@/components/DashboardLayout';
import CustomizationPanel from '@/components/settings/CustomizationPanel';
import { usePreferencesStore } from '@/store/preferencesStore';

export default function SettingsPage() {
  const fontColor = usePreferencesStore(s => s.fontColor);
  const fontOpacity = usePreferencesStore(s => s.fontOpacity);

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
      <div className="p-6">
        <CustomizationPanel />
      </div>
    </DashboardLayout>
  );
}
