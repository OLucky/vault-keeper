import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { START_HEX, GRID_CELLS, DIRECTION_LABELS } from '../lib/weatherGrid'
import type { Direction } from '../lib/weatherGrid'
import { resolveMove, rollD6 } from '../lib/weatherMovement'

interface WeatherStoreState {
  markerPosition: { row: number; col: number }
  lastRoll: { value: number; direction: string } | null
  advanceDay: () => void
  placeMarker: (row: number, col: number) => void
  reset: () => void
}

export const useWeatherStore = create<WeatherStoreState>()(
  persist(
    (set) => ({
      markerPosition: { ...START_HEX },
      lastRoll: null,

      advanceDay: () =>
        set((state) => {
          const roll = rollD6() as Direction
          const newCell = resolveMove(
            state.markerPosition.row,
            state.markerPosition.col,
            roll,
            GRID_CELLS,
          )
          return {
            markerPosition: { row: newCell.row, col: newCell.col },
            lastRoll: { value: roll, direction: DIRECTION_LABELS[roll] },
          }
        }),

      placeMarker: (row, col) =>
        set({ markerPosition: { row, col }, lastRoll: null }),

      reset: () =>
        set({ markerPosition: { ...START_HEX }, lastRoll: null }),
    }),
    {
      name: 'vault-keeper-weather',
      partialize: (state) => ({ markerPosition: state.markerPosition }),
    },
  ),
)
