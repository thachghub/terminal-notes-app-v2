'use client';

import { useState, useEffect, useRef } from 'react';
import { usePreferencesStore } from '@/store/preferencesStore';
import { auth } from '@/firebase/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useTranslation } from '@/hooks/useTranslation';

export default function TerminalDisplayWidgets() {
  const { t } = useTranslation();
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
  const [user, setUser] = useState<User | null>(auth.currentUser);

  // Widget visibility preferences from Zustand (use individual selectors!)
  const showUserInfo = usePreferencesStore(s => s.showUserInfo);
  const showCurrentTime = usePreferencesStore(s => s.showCurrentTime);
  const showCurrentDate = usePreferencesStore(s => s.showCurrentDate);
  const showSunriseSunset = usePreferencesStore(s => s.showSunriseSunset);
  const showWeekNumber = usePreferencesStore(s => s.showWeekNumber);

  // --- SUNRISE/SUNSET STATE AND LOGIC ---
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showTimezoneDropdown) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTimezoneDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTimezoneDropdown]);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-1 pl-2 max-w-md">
      {showUserInfo && (
        <div className="flex gap-24 items-center">
          <span className="text-cyan-500">{t('userLabel')}</span>
          <span className="text-cyan-300">{user?.email || t('notSignedIn')}</span>
        </div>
      )}
      {showCurrentDate && (
        <div className="flex gap-24 items-center">
          <span className="text-cyan-500">{t('dateLabel')}</span>
          <span className="text-cyan-300">May 23, 2025</span>
        </div>
      )}
      {showCurrentTime && (
        <div className="flex gap-24 items-center">
          <span className="text-cyan-500">{t('timeLabel')}</span>
          <span className="text-cyan-300">{currentTime || t('loading')}</span>
        </div>
      )}
      {showWeekNumber && (
        <div className="flex gap-24 items-center">
          <span className="text-cyan-500">{t('weekLabel')}</span>
          <span className="text-cyan-300">{getWeekString()}</span>
        </div>
      )}
      {showSunriseSunset && (
        <div className="flex gap-24 items-center relative" ref={dropdownRef}>
          <button
            className="text-cyan-500 cursor-pointer select-none hover:text-yellow-400 transition-colors"
            title="Click to change time zone"
            aria-haspopup="listbox"
            aria-expanded={showTimezoneDropdown}
            aria-controls="timezone-listbox"
            aria-label="Change time zone"
            onClick={() => setShowTimezoneDropdown((v: boolean) => !v)}
            type="button"
          >
            {label === '*Sunrise:' ? t('sunriseLabel') : t('sunsetLabel')}
          </button>
          <span className="text-cyan-300">{displayTime}</span>
          {showTimezoneDropdown && (
            <div className="absolute left-0 top-6 bg-gray-900 border border-cyan-700 rounded shadow-lg z-10">
              <ul className="py-1 px-2 max-h-48 overflow-y-auto" id="timezone-listbox" role="listbox">
                {timezones.map((tz: string) => (
                  <li
                    key={tz}
                    className={`py-1 px-2 hover:bg-cyan-800 cursor-pointer ${tz === timezone ? 'text-yellow-400' : 'text-cyan-300'}`}
                    role="option"
                    aria-selected={tz === timezone}
                    tabIndex={0}
                    onClick={() => {
                      setTimezone(tz);
                      setShowTimezoneDropdown(false);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setTimezone(tz);
                        setShowTimezoneDropdown(false);
                      }
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
    </div>
  );
}
