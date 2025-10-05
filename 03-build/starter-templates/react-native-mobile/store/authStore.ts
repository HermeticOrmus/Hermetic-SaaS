/**
 * Auth State Store
 *
 * Hermetic Principle: Elegant
 * - Simple state management with Zustand
 * - No boilerplate
 */

import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  isLoading: true,

  setUser: user => set({ user }),
  setLoading: loading => set({ isLoading: loading }),

  reset: () =>
    set({
      user: null,
      isLoading: false,
    }),
}));
