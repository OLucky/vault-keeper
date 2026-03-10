import { describe, it, expect } from 'vitest'
import {
  WeatherType,
  Direction,
  GRID_CELLS,
  START_HEX,
  WEATHER_EFFECTS,
  DIRECTION_LABELS,
} from '../weatherGrid'

describe('GRID_CELLS', () => {
  it('every hex has a valid weather type', () => {
    const validWeathers = Object.values(WeatherType)
    for (const cell of GRID_CELLS) {
      expect(validWeathers).toContain(cell.weather)
    }
  })

  it('has exactly 48 cells', () => {
    expect(GRID_CELLS).toHaveLength(48)
  })

  it('has no duplicate coordinates', () => {
    const keys = GRID_CELLS.map((c) => `${c.row},${c.col}`)
    const unique = new Set(keys)
    expect(unique.size).toBe(GRID_CELLS.length)
  })

  it('all 8 weather types are represented', () => {
    const weathersInGrid = new Set(GRID_CELLS.map((c) => c.weather))
    for (const wt of Object.values(WeatherType)) {
      expect(weathersInGrid).toContain(wt)
    }
  })
})

describe('START_HEX', () => {
  it('matches an actual cell in GRID_CELLS', () => {
    const match = GRID_CELLS.find(
      (c) => c.row === START_HEX.row && c.col === START_HEX.col
    )
    expect(match).toBeDefined()
  })
})

describe('WEATHER_EFFECTS', () => {
  it('has an entry for every WeatherType with non-empty name and description', () => {
    for (const wt of Object.values(WeatherType)) {
      const effect = WEATHER_EFFECTS[wt]
      expect(effect).toBeDefined()
      expect(effect.name).toBeTruthy()
      expect(effect.description).toBeTruthy()
    }
  })
})

describe('DIRECTION_LABELS', () => {
  it('has an entry for every Direction enum value', () => {
    const numericValues = Object.values(Direction).filter(
      (v): v is Direction => typeof v === 'number'
    )
    for (const dir of numericValues) {
      expect(DIRECTION_LABELS[dir]).toBeDefined()
      expect(DIRECTION_LABELS[dir]).toBeTruthy()
    }
  })
})
