import { create, StateCreator } from 'zustand';

// Define the UIStore type
export type UIStore = {
  showSignIn: boolean;
  showSignUp: boolean;
  showCustomize: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  globalLoading: boolean;
  globalError: string | null;
  toggleSignIn: () => void;
  toggleSignUp: () => void;
  toggleCustomize: () => void;
  setShowSignIn: (value: boolean) => void;
  setShowSignUp: (value: boolean) => void;
  setShowCustomize: (value: boolean) => void;
  setAuthLoading: (v: boolean) => void;
  setAuthError: (msg: string | null) => void;
  setGlobalLoading: (v: boolean) => void;
  setGlobalError: (msg: string | null) => void;
};

export const useUIStore = create<UIStore>(((set: (fn: (state: UIStore) => Partial<UIStore> | UIStore) => void) => ({
  showSignIn: false,
  showSignUp: false,
  showCustomize: false,
  isAuthLoading: false,
  authError: null,
  globalLoading: false,
  globalError: null,
  toggleSignIn: () => set((s: UIStore) => ({ showSignIn: !s.showSignIn })),
  toggleSignUp: () => set((s: UIStore) => ({ showSignUp: !s.showSignUp })),
  toggleCustomize: () => set((s: UIStore) => ({ showCustomize: !s.showCustomize })),
  setShowSignIn: (v: boolean) => set(() => ({ showSignIn: v })),
  setShowSignUp: (v: boolean) => set(() => ({ showSignUp: v })),
  setShowCustomize: (v: boolean) => set(() => ({ showCustomize: v })),
  setAuthLoading: (v: boolean) => set(() => ({ isAuthLoading: v })),
  setAuthError: (msg: string | null) => set(() => ({ authError: msg })),
  setGlobalLoading: (v: boolean) => set(() => ({ globalLoading: v })),
  setGlobalError: (msg: string | null) => set(() => ({ globalError: msg })),
}))); 