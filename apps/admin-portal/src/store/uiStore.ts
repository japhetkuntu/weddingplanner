import { create } from "zustand";

interface UiState {
  lastClientId: string;
  setLastClientId: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  lastClientId: "",
  setLastClientId: (id) => set({ lastClientId: id }),
}));
