import { ZodError } from 'zod'
import { TableSetSchema, getDieMax } from './types'
import type { Entry, TableSet } from './types'

export function validateRangeCoverage(
  entries: Entry[],
  dieMax: number
): { valid: boolean; error?: string } {
  // Sort entries by the start of their range
  const sorted = [...entries].sort((a, b) => a.range[0] - b.range[0])

  let expected = 1
  for (const entry of sorted) {
    const [low, high] = entry.range

    if (low > expected) {
      return {
        valid: false,
        error: `Gap in ranges: missing value${expected === low - 1 ? '' : 's'} ${expected}${expected === low - 1 ? '' : `-${low - 1}`}`,
      }
    }

    if (low < expected) {
      return {
        valid: false,
        error: `Overlapping ranges: value ${low} is covered by multiple entries`,
      }
    }

    expected = high + 1
  }

  if (expected <= dieMax) {
    return {
      valid: false,
      error: `Gap in ranges: missing value${expected === dieMax ? '' : 's'} ${expected}${expected === dieMax ? '' : `-${dieMax}`}`,
    }
  }

  if (expected > dieMax + 1) {
    return {
      valid: false,
      error: `Ranges exceed die maximum: highest value ${expected - 1} exceeds ${dieMax}`,
    }
  }

  return { valid: true }
}

export function formatValidationError(zodError: ZodError): string {
  return zodError.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
      return `${path}${issue.message}`
    })
    .join('; ')
}

export function validateTableSet(
  data: unknown
): { success: true; data: TableSet } | { success: false; error: string } {
  const result = TableSetSchema.safeParse(data)

  if (!result.success) {
    return { success: false, error: formatValidationError(result.error) }
  }

  const tableSet = result.data

  for (const table of tableSet.tables) {
    if (table.type === 'computed') continue
    const dieMax = getDieMax(table.die)
    const coverage = validateRangeCoverage(table.entries, dieMax)
    if (!coverage.valid) {
      return {
        success: false,
        error: `Table "${table.name}": ${coverage.error}`,
      }
    }
  }

  return { success: true, data: tableSet }
}
