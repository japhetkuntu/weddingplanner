import { create } from "zustand";
import type { AdminUser } from "@/types";
import { getMe, login, logout } from "@/lib/api";
import { tokenStore } from "@/lib/httpClient";
import { useClientsStore } from "@/store/clientsStore";
import { useUiStore } from "@/store/uiStore";

/** Wipes every other admin's in-memory app-data caches — `clientsStore`'s fetched list (and its
 * `loaded` guard, which otherwise never refetches for the lifetime of the tab) and `uiStore`'s
 * last-viewed client. Without this, signing in as a different admin in the same tab could still
 * show the previous admin's cached client list — including clients this admin isn't assigned to —
 * until a hard refresh reset the JS module state. Called on both sign-in and sign-out so a stale
 * cache can never survive a session boundary in either direction. */
function resetSessionScopedCaches() {
  useClientsStore.setState({ clients: [], loading: false, loaded: false });
  useUiStore.setState({ lastClientId: "" });
}

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
    resetSessionScopedCaches();
    const user = await login(email, password);
    set({ user });
    return user;
  },
  signOut: async () => {
    await logout();
    set({ user: null });
    resetSessionScopedCaches();
  },
  setUser: (user) => set({ user }),
}));
