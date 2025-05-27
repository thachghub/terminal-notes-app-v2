'use client';
import { usePreferencesStore } from '@/store/preferencesStore';

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export default function TimezoneSelector() {
  const timezone = usePreferencesStore(s => s.timezone);
  const setTimezone = usePreferencesStore(s => s.setTimezone);

  return (
    <div>
      <label htmlFor="timezone-selector">Timezone</label>
      <select
        id="timezone-selector"
        value={timezone}
        onChange={e => setTimezone(e.target.value)}
        className="ml-2 p-1 rounded bg-neutral-700 text-white"
      >
        {timezones.map(tz => (
          <option key={tz} value={tz}>{tz}</option>
        ))}
      </select>
    </div>
  );
} 