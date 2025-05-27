import { create } from 'zustand';

export type Preferences = {
  fontColor: string;
  fontOpacity: number;
  timezone: string;
  showSeconds: boolean;
};

export const DEFAULT_PREFERENCES: Preferences = {
  fontColor: '#22d3ee',
  fontOpacity: 1,
  timezone: 'America/New_York',
  showSeconds: false,
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
  savedLoadOuts: Record<string, Preferences>;
  saveLoadOut: (key: string) => void;
  loadLoadOut: (key: string) => void;
  resetLoadOut: (key: string) => void;
  resetToDefault: () => void;
  loadOutLabels: Record<string, string>;
  renameLoadOut: (key: string, newName: string) => void;
};

export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
  ...DEFAULT_PREFERENCES,
  setFontColor: (color) => set({ fontColor: color }),
  setFontOpacity: (opacity) => set({ fontOpacity: opacity }),
  setTimezone: (tz) => set({ timezone: tz }),
  setShowSeconds: (v) => set({ showSeconds: v }),
  savedLoadOuts: {},
  saveLoadOut: (key) => {
    const { fontColor, fontOpacity, timezone, showSeconds } = get();
    set((state) => ({
      savedLoadOuts: {
        ...state.savedLoadOuts,
        [key]: { fontColor, fontOpacity, timezone, showSeconds },
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
})); 