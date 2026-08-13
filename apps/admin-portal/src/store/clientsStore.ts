import { create } from "zustand";
import type { Client } from "@/types";
import { getClients } from "@/lib/api";

interface ClientsState {
  clients: Client[];
  loading: boolean;
  loaded: boolean;
  fetch: () => Promise<void>;
  refresh: () => Promise<void>;
  upsert: (client: Client) => void;
}

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: [],
  loading: false,
  loaded: false,
  fetch: async () => {
    if (get().loaded || get().loading) return;
    await get().refresh();
  },
  refresh: async () => {
    set({ loading: true });
    try {
      const clients = await getClients();
      set({ clients, loading: false, loaded: true });
    } catch {
      set({ loading: false });
    }
  },
  upsert: (client) =>
    set((s) => {
      const index = s.clients.findIndex((c) => c.id === client.id);
      if (index === -1) return { clients: [...s.clients, client] };
      const next = [...s.clients];
      next[index] = client;
      return { clients: next };
    }),
}));
