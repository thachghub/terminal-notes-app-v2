'use client';

import { useState, useEffect } from 'react';

export default function TerminalDisplayWidgets() {
  // Helper to get ISO week number
  function getWeekString() {
    const now = new Date();
    // Copy date so don't modify original
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil((((d.getTime()-yearStart.getTime())/86400000)+1)/7);
    return `${weekNo}/52`;
  }
  const [currentTime, setCurrentTime] = useState('');

  // --- SUNRISE/SUNSET STATE AND LOGIC ---
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [sunrise, setSunrise] = useState('6:00 AM');
  const [sunset, setSunset] = useState('6:00 PM');
  const [label, setLabel] = useState('*Sunrise:');
  const [displayTime, setDisplayTime] = useState('6:00 AM');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 40.7128, lng: -74.006 }); // Default: New York

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

  // Get user geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => {
          // If denied, keep default (New York)
        }
      );
    }
  }, []);

  // Fetch sunrise/sunset from API when coords or timezone changes
  useEffect(() => {
    const fetchSunData = async () => {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const url = `https://api.sunrise-sunset.org/json?lat=${coords.lat}&lng=${coords.lng}&date=${dateStr}&formatted=0`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 'OK') {
          // Convert UTC times to user's selected timezone
          const toLocal = (iso: string) => {
            try {
              return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: timezone });
            } catch {
              return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            }
          };
          setSunrise(toLocal(data.results.sunrise));
          setSunset(toLocal(data.results.sunset));
        }
      } catch (e) {
        // fallback: do nothing, keep previous
      }
    };
    fetchSunData();
  }, [coords, timezone]);

  // Logic for label and value
  useEffect(() => {
    function parseTime(str: string) {
      const [time, modifier] = str.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return { hours, minutes };
    }
    const now = new Date();
    const { hours: sunriseH, minutes: sunriseM } = parseTime(sunrise);
    const { hours: sunsetH, minutes: sunsetM } = parseTime(sunset);
    const sunriseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), sunriseH, sunriseM);
    const sunsetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), sunsetH, sunsetM);
    if (now < sunriseDate) {
      setLabel('*Sunrise:');
      setDisplayTime(sunrise);
    } else if (now < sunsetDate) {
      setLabel('*Sunset:');
      setDisplayTime(sunset);
    } else {
      setLabel('*Sunrise:');
      setDisplayTime(sunrise);
    }
  }, [sunrise, sunset, currentTime]);

  // --- END SUNRISE/SUNSET STATE AND LOGIC ---

  useEffect(() => {
    // Initialize with current time
    setCurrentTime(new Date().toLocaleTimeString());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // --- CUSTOMIZATION STATE ---
  const [showCustomize, setShowCustomize] = useState(false);
  const [visibleRows, setVisibleRows] = useState({
    user: true,
    date: true,
    time: true,
    week: true,
    sunrise: true,
    sunset: true,
  });

  function handleToggleRow(row: keyof typeof visibleRows) {
    setVisibleRows(v => ({ ...v, [row]: !v[row] }));
  }

  // --- END CUSTOMIZATION STATE ---

  return (
    <div className="space-y-1 pl-2 max-w-md">

      {visibleRows.user && (
        <div className="flex gap-24 items-center">
          <span className="text-cyan-500">user:</span>
          <span className="text-cyan-300">example@email.com</span>
        </div>
      )}
      {visibleRows.date && (
        <div className="flex gap-24 items-center">
          <span className="text-cyan-500">Date:</span>
          <span className="text-cyan-300">May 23, 2025</span>
        </div>
      )}
      {visibleRows.time && (
        <div className="flex gap-24 items-center">
          <span className="text-cyan-500">Time:</span>
          <span className="text-cyan-300">{currentTime || 'Loading...'}</span>
        </div>
      )}
      {visibleRows.week && (
        <div className="flex gap-24 items-center">
          <span className="text-cyan-500">Week:</span>
          <span className="text-cyan-300">{getWeekString()}</span>
        </div>
      )}
      {visibleRows.sunrise && (
        <div className="flex gap-24 items-center relative">
          <span
            className="text-cyan-500 cursor-pointer select-none"
            title="Click to change time zone"
            onClick={() => setShowTimezoneDropdown((v: boolean) => !v)}
          >
            {label}
          </span>
          <span className="text-cyan-300">{displayTime}</span>
          {showTimezoneDropdown && (
            <div className="absolute left-0 top-6 bg-gray-900 border border-cyan-700 rounded shadow-lg z-10">
              <ul className="py-1 px-2 max-h-48 overflow-y-auto">
                {timezones.map((tz: string) => (
                  <li
                    key={tz}
                    className={`py-1 px-2 hover:bg-cyan-800 cursor-pointer ${tz === timezone ? 'text-yellow-400' : 'text-cyan-300'}`}
                    onClick={() => {
                      setTimezone(tz);
                      setShowTimezoneDropdown(false);
                    }}
                  >
                    {tz}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {visibleRows.sunset && (
        <div className="flex gap-24 items-center relative">
          <span
            className="text-cyan-500 cursor-pointer select-none"
            title="Click to change time zone"
            onClick={() => setShowTimezoneDropdown((v: boolean) => !v)}
          >
            *Sunset:
          </span>
          <span className="text-cyan-300">{sunset}</span>
        </div>
      )}
    </div>
  );
}
