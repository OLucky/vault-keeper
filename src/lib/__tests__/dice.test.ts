import { describe, it, expect } from 'vitest'
import { rollDie } from '../dice'
import { DIE_MAX } from '../types'
import type { DieType } from '../types'

describe('rollDie', () => {
  const dieTypes: DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100']

  it.each(dieTypes)(
    'returns values within valid range for %s',
    (die) => {
      const max = DIE_MAX[die]
      for (let i = 0; i < 1000; i++) {
        const result = rollDie(die)
        expect(result).toBeGreaterThanOrEqual(1)
        expect(result).toBeLessThanOrEqual(max)
      }
    }
  )

  it.each(dieTypes)(
    'returns integers only for %s',
    (die) => {
      for (let i = 0; i < 1000; i++) {
        const result = rollDie(die)
        expect(Number.isInteger(result)).toBe(true)
      }
    }
  )
})
