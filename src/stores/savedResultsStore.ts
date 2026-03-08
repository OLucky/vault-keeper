import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GeneratedResult, ResultField } from '../lib/types'

export interface SavedResult {
  id: string
  savedAt: number
  categoryId: string
  categoryName: string
  tableSetName: string
  fields: ResultField[]
  note: string
}

interface SavedResultsStoreState {
  savedResults: SavedResult[]
  saveResult: (result: GeneratedResult, categoryId: string) => void
  removeResult: (id: string) => void
  updateNote: (id: string, note: string) => void
  isSaved: (id: string) => boolean
}

export const useSavedResultsStore = create<SavedResultsStoreState>()(
  persist(
    (set, get) => ({
      savedResults: [],

      saveResult: (result, categoryId) =>
        set((state) => {
          if (state.savedResults.some((r) => r.id === result.id)) {
            return state
          }
          const saved: SavedResult = {
            id: result.id,
            savedAt: Date.now(),
            categoryId,
            categoryName: result.categoryName,
            tableSetName: result.tableSetName,
            fields: result.fields,
            note: '',
          }
          return { savedResults: [...state.savedResults, saved] }
        }),

      removeResult: (id) =>
        set((state) => ({
          savedResults: state.savedResults.filter((r) => r.id !== id),
        })),

      updateNote: (id, note) =>
        set((state) => ({
          savedResults: state.savedResults.map((r) =>
            r.id === id ? { ...r, note } : r,
          ),
        })),

      isSaved: (id) => get().savedResults.some((r) => r.id === id),
    }),
    {
      name: 'vault-keeper-saved-results',
    },
  ),
)
