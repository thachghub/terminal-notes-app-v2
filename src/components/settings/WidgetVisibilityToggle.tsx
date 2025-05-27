'use client';

import { usePreferencesStore } from '@/store/preferencesStore';

export default function WidgetVisibilityToggle() {
  const showUserInfo = usePreferencesStore(s => s.showUserInfo);
  const showCurrentTime = usePreferencesStore(s => s.showCurrentTime);
  const showCurrentDate = usePreferencesStore(s => s.showCurrentDate);
  const showSunriseSunset = usePreferencesStore(s => s.showSunriseSunset);
  const showWeekNumber = usePreferencesStore(s => s.showWeekNumber);

  const setShowUserInfo = usePreferencesStore(s => s.setShowUserInfo);
  const setShowCurrentTime = usePreferencesStore(s => s.setShowCurrentTime);
  const setShowCurrentDate = usePreferencesStore(s => s.setShowCurrentDate);
  const setShowSunriseSunset = usePreferencesStore(s => s.setShowSunriseSunset);
  const setShowWeekNumber = usePreferencesStore(s => s.setShowWeekNumber);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold uppercase tracking-wide text-cyan-300">Home Terminal Widgets</h3>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={showUserInfo} onChange={(e) => setShowUserInfo(e.target.checked)} />
        Show User Info
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={showCurrentTime} onChange={(e) => setShowCurrentTime(e.target.checked)} />
        Show Current Time
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={showCurrentDate} onChange={(e) => setShowCurrentDate(e.target.checked)} />
        Show Current Date
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={showSunriseSunset} onChange={(e) => setShowSunriseSunset(e.target.checked)} />
        Show Sunrise/Sunset
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={showWeekNumber} onChange={(e) => setShowWeekNumber(e.target.checked)} />
        Show Week Number
      </label>
    </div>
  );
} 