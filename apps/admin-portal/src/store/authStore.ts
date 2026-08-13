import { create } from "zustand";
import type { AdminUser } from "@/types";
import { getMe, login, logout } from "@/lib/api";
import { tokenStore } from "@/lib/httpClient";

interface AuthState {
  user: AdminUser | null;
  initializing: boolean;
  bootstrap: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<AdminUser>;
  signOut: () => Promise<void>;
  setUser: (user: AdminUser) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initializing: true,
  bootstrap: async () => {
    if (!tokenStore.getAccessToken()) {
      set({ initializing: false });
      return;
    }
    try {
      const user = await getMe();
      set({ user, initializing: false });
    } catch {
      tokenStore.clear();
      set({ user: null, initializing: false });
    }
  },
  signIn: async (email, password) => {
    const user = await login(email, password);
    set({ user });
    return user;
  },
  signOut: async () => {
    await logout();
    set({ user: null });
  },
  setUser: (user) => set({ user }),
}));
