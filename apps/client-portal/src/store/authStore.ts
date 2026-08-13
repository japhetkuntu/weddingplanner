import { create } from "zustand";
import { getProfile, login, logout } from "@/lib/api";
import { tokenStore } from "@/lib/httpClient";
import type { CoupleProfile } from "@/types";

interface AuthState {
  profile: CoupleProfile | null;
  initializing: boolean;
  bootstrap: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  initializing: true,
  bootstrap: async () => {
    if (!tokenStore.getAccessToken()) {
      set({ initializing: false });
      return;
    }
    try {
      const profile = await getProfile();
      set({ profile, initializing: false });
    } catch {
      tokenStore.clear();
      set({ profile: null, initializing: false });
    }
  },
  signIn: async (email, password) => {
    await login(email, password);
    const profile = await getProfile();
    set({ profile });
  },
  signOut: async () => {
    await logout();
    set({ profile: null });
  },
}));
