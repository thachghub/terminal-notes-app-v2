'use client';
import { useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import { usePreferencesStore } from '@/store/preferencesStore';
import { UserPreferencesService } from '@/services/userPreferencesService';

export default function UserPreferencesSync() {
  const hasInitialized = useRef(false);
  const userRef = useRef<User | null>(null);
  const preferencesService = UserPreferencesService.getInstance();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      userRef.current = user;

      if (user && user.emailVerified && !hasInitialized.current) {
        hasInitialized.current = true;
        
        try {
          // Load user preferences from Firebase
          const savedPreferences = await preferencesService.loadUserPreferences(user);
          
          if (savedPreferences) {
            // Update the store with Firebase preferences
            usePreferencesStore.setState(savedPreferences);
            console.log('Loaded user preferences from Firebase:', savedPreferences);
          }
        } catch (error) {
          console.error('Failed to load user preferences:', error);
        }
      } else if (!user) {
        hasInitialized.current = false;
        // Reset to guest mode (already handled by ClientHydratePreferences)
      }
    });

    return () => unsubscribe();
  }, [preferencesService]);

  // Save preferences to Firebase when they change (only for authenticated users)
  useEffect(() => {
    if (!hasInitialized.current) return;

    const unsubscribe = usePreferencesStore.subscribe(async (state) => {
      const user = userRef.current;
      
      if (user && user.emailVerified) {
        try {
          const preferences = {
            fontColor: state.fontColor,
            fontOpacity: state.fontOpacity,
            timezone: state.timezone,
            showSeconds: state.showSeconds,
            language: state.language,
            showUserInfo: state.showUserInfo,
            showCurrentTime: state.showCurrentTime,
            showCurrentDate: state.showCurrentDate,
            showSunriseSunset: state.showSunriseSunset,
            showWeekNumber: state.showWeekNumber,
          };

          await preferencesService.saveUserPreferences(user, preferences);
        } catch (error) {
          console.error('Failed to save user preferences:', error);
        }
      }
    });

    return unsubscribe;
  }, [preferencesService]);

  return null; // This component doesn't render anything
} 