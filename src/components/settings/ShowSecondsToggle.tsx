'use client';
import { usePreferencesStore } from '@/store/preferencesStore';

export default function ShowSecondsToggle() {
  const showSeconds = usePreferencesStore(s => s.showSeconds);
  const setShowSeconds = usePreferencesStore(s => s.setShowSeconds);

  return (
    <div>
      <label htmlFor="show-seconds">Show Seconds</label>
      <input
        id="show-seconds"
        type="checkbox"
        checked={showSeconds}
        onChange={e => setShowSeconds(e.target.checked)}
        className="ml-2"
      />
    </div>
  );
} 