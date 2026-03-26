import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PinnedTableSet {
  categoryId: string;
  fileName: string;
  tableSetName: string;
  categoryName: string;
}

interface FavoritesStoreState {
  pinnedTableSets: PinnedTableSet[];
  addPinned: (item: PinnedTableSet) => void;
  removePinned: (categoryId: string, fileName: string) => void;
  reorder: (items: PinnedTableSet[]) => void;
  isPinned: (categoryId: string, fileName: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStoreState>()(
  persist(
    (set, get) => ({
      pinnedTableSets: [],

      addPinned: (item) =>
        set((state) => {
          if (
            state.pinnedTableSets.some(
              (p) => p.categoryId === item.categoryId && p.fileName === item.fileName,
            )
          ) {
            return state;
          }
          return { pinnedTableSets: [...state.pinnedTableSets, item] };
        }),

      removePinned: (categoryId, fileName) =>
        set((state) => ({
          pinnedTableSets: state.pinnedTableSets.filter(
            (p) => !(p.categoryId === categoryId && p.fileName === fileName),
          ),
        })),

      reorder: (items) => set({ pinnedTableSets: items }),

      isPinned: (categoryId, fileName) =>
        get().pinnedTableSets.some((p) => p.categoryId === categoryId && p.fileName === fileName),
    }),
    {
      name: "vault-keeper-favorites",
      partialize: (state) => ({ pinnedTableSets: state.pinnedTableSets }),
    },
  ),
);
