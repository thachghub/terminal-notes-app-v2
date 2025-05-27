import { create } from 'zustand';

export type PreferencesStore = {
  fontColor: string;
  setFontColor: (color: string) => void;
  fontOpacity: number;
  setFontOpacity: (opacity: number) => void;
  timezone: string;
  setTimezone: (tz: string) => void;
  showSeconds: boolean;
  setShowSeconds: (v: boolean) => void;
  // Add more preferences as needed
};

export const usePreferencesStore = create<PreferencesStore>((set) => ({
  fontColor: '#22d3ee',
  setFontColor: (color) => set({ fontColor: color }),
  fontOpacity: 1,
  setFontOpacity: (opacity) => set({ fontOpacity: opacity }),
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  setTimezone: (tz) => set({ timezone: tz }),
  showSeconds: false,
  setShowSeconds: (v) => set({ showSeconds: v }),
})); 