import { create } from 'zustand';

export type Preferences = {
  fontColor: string;
  fontOpacity: number;
  timezone: string;
  showSeconds: boolean;
  language: string;
  // Widget visibility
  showUserInfo: boolean;
  showCurrentTime: boolean;
  showCurrentDate: boolean;
  showSunriseSunset: boolean;
  showWeekNumber: boolean;
};

export const DEFAULT_PREFERENCES: Preferences = {
  fontColor: '#22d3ee',
  fontOpacity: 1,
  timezone: 'America/New_York',
  showSeconds: false,
  language: 'en',
  showUserInfo: true,
  showCurrentTime: true,
  showCurrentDate: true,
  showSunriseSunset: true,
  showWeekNumber: true,
};

export type PreferencesStore = {
  fontColor: string;
  setFontColor: (color: string) => void;
  fontOpacity: number;
  setFontOpacity: (opacity: number) => void;
  timezone: string;
  setTimezone: (tz: string) => void;
  showSeconds: boolean;
  setShowSeconds: (v: boolean) => void;
  language: string;
  setLanguage: (lang: string) => void;
  savedLoadOuts: Record<string, Preferences>;
  saveLoadOut: (key: string) => void;
  loadLoadOut: (key: string) => void;
  resetLoadOut: (key: string) => void;
  resetToDefault: () => void;
  loadOutLabels: Record<string, string>;
  renameLoadOut: (key: string, newName: string) => void;
  // Widget visibility
  showUserInfo: boolean;
  setShowUserInfo: (v: boolean) => void;
  showCurrentTime: boolean;
  setShowCurrentTime: (v: boolean) => void;
  showCurrentDate: boolean;
  setShowCurrentDate: (v: boolean) => void;
  showSunriseSunset: boolean;
  setShowSunriseSunset: (v: boolean) => void;
  showWeekNumber: boolean;
  setShowWeekNumber: (v: boolean) => void;
};

export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
  ...DEFAULT_PREFERENCES,
  setFontColor: (color) => set({ fontColor: color }),
  setFontOpacity: (opacity) => set({ fontOpacity: opacity }),
  setTimezone: (tz) => set({ timezone: tz }),
  setShowSeconds: (v) => set({ showSeconds: v }),
  setLanguage: (lang) => set({ language: lang }),
  savedLoadOuts: {},
  saveLoadOut: (key) => {
    const { fontColor, fontOpacity, timezone, showSeconds, language, showUserInfo, showCurrentTime, showCurrentDate, showSunriseSunset, showWeekNumber } = get();
    set((state) => ({
      savedLoadOuts: {
        ...state.savedLoadOuts,
        [key]: { fontColor, fontOpacity, timezone, showSeconds, language, showUserInfo, showCurrentTime, showCurrentDate, showSunriseSunset, showWeekNumber },
      },
    }));
  },
  loadLoadOut: (key) => {
    const preset = get().savedLoadOuts[key];
    if (!preset) return;
    set({ ...preset });
  },
  resetLoadOut: (key) => {
    set((state) => {
      const updated = { ...state.savedLoadOuts };
      delete updated[key];
      return { savedLoadOuts: updated };
    });
  },
  resetToDefault: () => set(DEFAULT_PREFERENCES),
  loadOutLabels: {},
  renameLoadOut: (key, newName) =>
    set((state) => ({
      loadOutLabels: {
        ...state.loadOutLabels,
        [key]: newName,
      },
    })),
  // Widget visibility setters
  showUserInfo: true,
  setShowUserInfo: (v) => set({ showUserInfo: v }),
  showCurrentTime: true,
  setShowCurrentTime: (v) => set({ showCurrentTime: v }),
  showCurrentDate: true,
  setShowCurrentDate: (v) => set({ showCurrentDate: v }),
  showSunriseSunset: true,
  setShowSunriseSunset: (v) => set({ showSunriseSunset: v }),
  showWeekNumber: true,
  setShowWeekNumber: (v) => set({ showWeekNumber: v }),
})); 