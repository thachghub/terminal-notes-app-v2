'use client';

import { useEffect, useRef } from 'react';
import { usePreferencesStore, DEFAULT_PREFERENCES, Preferences } from '@/store/preferencesStore';

export default function ClientHydratePreferences() {
  const hasInitialized = useRef(false);

  // Only run on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Hydrate from localStorage
    try {
      const stored = localStorage.getItem('guest-preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only set state if different
        const current = usePreferencesStore.getState();
        let changed = false;
        (Object.keys(DEFAULT_PREFERENCES) as (keyof Preferences)[]).forEach((key) => {
          if (parsed[key] !== undefined && parsed[key] !== current[key]) {
            changed = true;
          }
        });
        if (changed) {
          usePreferencesStore.setState(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to hydrate preferences:', e);
    }
  }, []);

  // Save to localStorage on change, but only after hydration
  useEffect(() => {
    if (!hasInitialized.current) return;
    const unsub = usePreferencesStore.subscribe((state) => {
      try {
        localStorage.setItem(
          'guest-preferences',
          JSON.stringify({
            fontColor: state.fontColor,
            timezone: state.timezone,
            showSeconds: state.showSeconds,
            fontOpacity: state.fontOpacity,
            language: state.language,
            showKeyTutorial: state.showKeyTutorial,
          })
        );
      } catch (e) {
        console.warn('Failed to save preferences:', e);
      }
    });
    return unsub;
  }, []);

  return null;
} 