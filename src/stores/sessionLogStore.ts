import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GeneratedResult, ResultField } from "../lib/types";

export interface SessionLogEntry {
  id: string;
  timestamp: number;
  categoryId: string;
  categoryName: string;
  tableSetName: string;
  fields: ResultField[];
}

interface SessionLogStoreState {
  entries: SessionLogEntry[];
  sidebarOpen: boolean;
  unseenCount: number;
  addEntry: (result: GeneratedResult, categoryId: string) => void;
  removeEntry: (id: string) => void;
  clearAll: () => void;
  toggleSidebar: () => void;
  openSidebar: () => void;
}

export const useSessionLogStore = create<SessionLogStoreState>()(
  persist(
    (set) => ({
      entries: [],
      sidebarOpen: false,
      unseenCount: 0,

      addEntry: (result, categoryId) =>
        set((state) => {
          const entry: SessionLogEntry = {
            id: result.id,
            timestamp: Date.now(),
            categoryId,
            categoryName: result.categoryName,
            tableSetName: result.tableSetName,
            fields: result.fields,
          };
          return {
            entries: [entry, ...state.entries],
            unseenCount: state.sidebarOpen ? state.unseenCount : state.unseenCount + 1,
          };
        }),

      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        })),

      clearAll: () => set({ entries: [], unseenCount: 0 }),

      toggleSidebar: () =>
        set((state) => {
          const opening = !state.sidebarOpen;
          return {
            sidebarOpen: opening,
            unseenCount: opening ? 0 : state.unseenCount,
          };
        }),

      openSidebar: () => set({ sidebarOpen: true, unseenCount: 0 }),
    }),
    {
      name: "vault-keeper-session-log",
      partialize: (state) => ({ entries: state.entries }),
    },
  ),
);
