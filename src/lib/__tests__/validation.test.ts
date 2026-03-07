import { describe, it, expect } from 'vitest'
import { z, ZodError } from 'zod'
import {
  validateRangeCoverage,
  formatValidationError,
  validateTableSet,
} from '../validation'
import type { Entry } from '../types'

describe('validateRangeCoverage', () => {
  it('accepts valid full coverage', () => {
    const entries: Entry[] = [
      { range: [1, 2], title: 'A' },
      { range: [3, 4], title: 'B' },
      { range: [5, 6], title: 'C' },
    ]
    const result = validateRangeCoverage(entries, 6)
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('accepts single entry covering full range', () => {
    const entries: Entry[] = [{ range: [1, 6], title: 'All' }]
    const result = validateRangeCoverage(entries, 6)
    expect(result.valid).toBe(true)
  })

  it('accepts entries in any order', () => {
    const entries: Entry[] = [
      { range: [5, 6], title: 'C' },
      { range: [1, 2], title: 'A' },
      { range: [3, 4], title: 'B' },
    ]
    const result = validateRangeCoverage(entries, 6)
    expect(result.valid).toBe(true)
  })

  it('detects gap in ranges', () => {
    const entries: Entry[] = [
      { range: [1, 2], title: 'A' },
      { range: [4, 6], title: 'B' },
    ]
    const result = validateRangeCoverage(entries, 6)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Gap')
  })

  it('detects gap at the end', () => {
    const entries: Entry[] = [
      { range: [1, 2], title: 'A' },
      { range: [3, 4], title: 'B' },
    ]
    const result = validateRangeCoverage(entries, 6)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Gap')
  })

  it('detects overlapping ranges', () => {
    const entries: Entry[] = [
      { range: [1, 3], title: 'A' },
      { range: [3, 6], title: 'B' },
    ]
    const result = validateRangeCoverage(entries, 6)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Overlapping')
  })

  it('detects ranges exceeding die maximum', () => {
    const entries: Entry[] = [
      { range: [1, 4], title: 'A' },
      { range: [5, 8], title: 'B' },
    ]
    const result = validateRangeCoverage(entries, 6)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('exceed')
  })
})

describe('formatValidationError', () => {
  it('formats a ZodError into a readable string', () => {
    const result = z.object({ name: z.string() }).safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const message = formatValidationError(result.error as ZodError)
      expect(message).toContain('name')
    }
  })
})

describe('validateTableSet', () => {
  it('accepts a valid table set', () => {
    const data = {
      name: 'Test Generator',
      tables: [
        {
          name: 'Table',
          die: 'd6',
          entries: [
            { range: [1, 2], title: 'A' },
            { range: [3, 4], title: 'B' },
            { range: [5, 6], title: 'C' },
          ],
        },
      ],
    }
    const result = validateTableSet(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Test Generator')
    }
  })

  it('rejects invalid table set (bad schema)', () => {
    const data = { tables: [{ die: 'd6' }] }
    const result = validateTableSet(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeTruthy()
    }
  })

  it('rejects table set with range coverage errors', () => {
    const data = {
      name: 'Bad Generator',
      tables: [
        {
          name: 'Broken Table',
          die: 'd6',
          entries: [
            { range: [1, 2], title: 'A' },
            { range: [5, 6], title: 'B' },
          ],
        },
      ],
    }
    const result = validateTableSet(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Broken Table')
      expect(result.error).toContain('Gap')
    }
  })

  it('validates multiple tables in a set', () => {
    const data = {
      name: 'Multi Table',
      tables: [
        {
          name: 'Good Table',
          die: 'd4',
          entries: [
            { range: [1, 2], title: 'A' },
            { range: [3, 4], title: 'B' },
          ],
        },
        {
          name: 'Bad Table',
          die: 'd4',
          entries: [
            { range: [1, 1], title: 'A' },
            { range: [3, 4], title: 'B' },
          ],
        },
      ],
    }
    const result = validateTableSet(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Bad Table')
    }
  })
})
