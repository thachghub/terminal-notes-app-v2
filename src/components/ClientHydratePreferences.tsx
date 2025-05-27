'use client';

import { useEffect } from 'react';
import { usePreferencesStore } from '@/store/preferencesStore';

export default function ClientHydratePreferences() {
  useEffect(() => {
    const stored = localStorage.getItem('guest-preferences');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        usePreferencesStore.setState(parsed);
      } catch {
        console.warn('Invalid localStorage preferences');
      }
    }
  }, []);

  useEffect(() => {
    const unsub = usePreferencesStore.subscribe((state) => {
      localStorage.setItem(
        'guest-preferences',
        JSON.stringify({
          fontColor: state.fontColor,
          timezone: state.timezone,
          showSeconds: state.showSeconds,
        })
      );
    });
    return () => unsub();
  }, []);

  return null;
} 