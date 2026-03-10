import { describe, it, expect } from 'vitest'
import {
  getNeighborCoords,
  findCell,
  getOppositeDirection,
  resolveMove,
  getWrappedHex,
  rollD6,
} from '../weatherMovement'
import { Direction, GRID_CELLS, START_HEX } from '../weatherGrid'

describe('getNeighborCoords', () => {
  describe('from START hex (5,3) — odd row', () => {
    it('UpperLeft returns (4,3)', () => {
      expect(getNeighborCoords(5, 3, Direction.UpperLeft)).toEqual({ row: 4, col: 3 })
    })

    it('UpperRight returns (4,4)', () => {
      expect(getNeighborCoords(5, 3, Direction.UpperRight)).toEqual({ row: 4, col: 4 })
    })

    it('Right returns (5,4)', () => {
      expect(getNeighborCoords(5, 3, Direction.Right)).toEqual({ row: 5, col: 4 })
    })

    it('LowerRight returns (6,4)', () => {
      expect(getNeighborCoords(5, 3, Direction.LowerRight)).toEqual({ row: 6, col: 4 })
    })

    it('LowerLeft returns (6,3)', () => {
      expect(getNeighborCoords(5, 3, Direction.LowerLeft)).toEqual({ row: 6, col: 3 })
    })

    it('Left returns (5,2)', () => {
      expect(getNeighborCoords(5, 3, Direction.Left)).toEqual({ row: 5, col: 2 })
    })
  })

  describe('from an even row hex (4,3)', () => {
    it('UpperLeft returns (3,2)', () => {
      expect(getNeighborCoords(4, 3, Direction.UpperLeft)).toEqual({ row: 3, col: 2 })
    })

    it('UpperRight returns (3,3)', () => {
      expect(getNeighborCoords(4, 3, Direction.UpperRight)).toEqual({ row: 3, col: 3 })
    })

    it('Right returns (4,4)', () => {
      expect(getNeighborCoords(4, 3, Direction.Right)).toEqual({ row: 4, col: 4 })
    })

    it('LowerRight returns (5,3)', () => {
      expect(getNeighborCoords(4, 3, Direction.LowerRight)).toEqual({ row: 5, col: 3 })
    })

    it('LowerLeft returns (5,2)', () => {
      expect(getNeighborCoords(4, 3, Direction.LowerLeft)).toEqual({ row: 5, col: 2 })
    })

    it('Left returns (4,2)', () => {
      expect(getNeighborCoords(4, 3, Direction.Left)).toEqual({ row: 4, col: 2 })
    })
  })
})

describe('findCell', () => {
  it('returns the correct HexCell for an existing cell', () => {
    const cell = findCell(5, 3, GRID_CELLS)
    expect(cell).toBeDefined()
    expect(cell!.row).toBe(5)
    expect(cell!.col).toBe(3)
  })

  it('returns undefined for a non-existent cell', () => {
    const cell = findCell(99, 99, GRID_CELLS)
    expect(cell).toBeUndefined()
  })
})

describe('getOppositeDirection', () => {
  it('UpperLeft (1) ↔ LowerRight (4)', () => {
    expect(getOppositeDirection(Direction.UpperLeft)).toBe(Direction.LowerRight)
    expect(getOppositeDirection(Direction.LowerRight)).toBe(Direction.UpperLeft)
  })

  it('UpperRight (2) ↔ LowerLeft (5)', () => {
    expect(getOppositeDirection(Direction.UpperRight)).toBe(Direction.LowerLeft)
    expect(getOppositeDirection(Direction.LowerLeft)).toBe(Direction.UpperRight)
  })

  it('Right (3) ↔ Left (6)', () => {
    expect(getOppositeDirection(Direction.Right)).toBe(Direction.Left)
    expect(getOppositeDirection(Direction.Left)).toBe(Direction.Right)
  })
})

describe('resolveMove — normal movement', () => {
  it('moving Right from START (5,3) returns (5,4)', () => {
    const result = resolveMove(START_HEX.row, START_HEX.col, Direction.Right, GRID_CELLS)
    expect(result.row).toBe(5)
    expect(result.col).toBe(4)
  })

  it('moving Left from START (5,3) returns (5,2)', () => {
    const result = resolveMove(START_HEX.row, START_HEX.col, Direction.Left, GRID_CELLS)
    expect(result.row).toBe(5)
    expect(result.col).toBe(2)
  })

  it('moving UpperLeft from START (5,3) returns (4,3)', () => {
    const result = resolveMove(START_HEX.row, START_HEX.col, Direction.UpperLeft, GRID_CELLS)
    expect(result.row).toBe(4)
    expect(result.col).toBe(3)
  })

  it('moving LowerRight from START (5,3) returns (6,4)', () => {
    const result = resolveMove(START_HEX.row, START_HEX.col, Direction.LowerRight, GRID_CELLS)
    expect(result.row).toBe(6)
    expect(result.col).toBe(4)
  })
})

describe('resolveMove — X-boundary blocking', () => {
  it('from (0,3) moving UpperLeft is blocked — stays at (0,3)', () => {
    const result = resolveMove(0, 3, Direction.UpperLeft, GRID_CELLS)
    expect(result.row).toBe(0)
    expect(result.col).toBe(3)
  })

  it('from (10,3) moving LowerRight is blocked — stays at (10,3)', () => {
    const result = resolveMove(10, 3, Direction.LowerRight, GRID_CELLS)
    expect(result.row).toBe(10)
    expect(result.col).toBe(3)
  })

  it('from (9,2) moving LowerLeft is blocked — stays at (9,2)', () => {
    const result = resolveMove(9, 2, Direction.LowerLeft, GRID_CELLS)
    expect(result.row).toBe(9)
    expect(result.col).toBe(2)
  })
})

describe('resolveMove — wrap-around', () => {
  it('from a perimeter hex moving off-grid wraps to the opposite side', () => {
    // (5,0) moving Left goes off-grid and is not X-blocked, so it should wrap
    const result = resolveMove(5, 0, Direction.Left, GRID_CELLS)
    expect(result).toBeDefined()
    // Should not be the same cell — it should have wrapped
    expect(result.row !== 5 || result.col !== 0).toBe(true)
    // The result must be a valid grid cell
    expect(GRID_CELLS.some((c) => c.row === result.row && c.col === result.col)).toBe(true)
  })

  it('from (6,6) moving Right wraps to the opposite side', () => {
    const result = resolveMove(6, 6, Direction.Right, GRID_CELLS)
    expect(result).toBeDefined()
    expect(result.row !== 6 || result.col !== 6).toBe(true)
    expect(GRID_CELLS.some((c) => c.row === result.row && c.col === result.col)).toBe(true)
  })
})

describe('getWrappedHex', () => {
  it('wrapping Left from (5,0) returns a cell on the right side of the grid', () => {
    const result = getWrappedHex(5, 0, Direction.Left, GRID_CELLS)
    expect(result).toBeDefined()
    expect(result!.col).toBeGreaterThan(0)
    expect(GRID_CELLS.some((c) => c.row === result!.row && c.col === result!.col)).toBe(true)
  })

  it('wrapping Right from (6,6) returns a cell on the left side of the grid', () => {
    const result = getWrappedHex(6, 6, Direction.Right, GRID_CELLS)
    expect(result).toBeDefined()
    expect(result!.col).toBeLessThan(6)
    expect(GRID_CELLS.some((c) => c.row === result!.row && c.col === result!.col)).toBe(true)
  })

  it('returned cell is always in the grid', () => {
    const result = getWrappedHex(4, 0, Direction.Left, GRID_CELLS)
    expect(result).toBeDefined()
    expect(GRID_CELLS.some((c) => c.row === result!.row && c.col === result!.col)).toBe(true)
  })
})

describe('rollD6', () => {
  it('returns a value between 1 and 6 inclusive', () => {
    for (let i = 0; i < 200; i++) {
      const result = rollD6()
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(6)
    }
  })

  it('returns integers only', () => {
    for (let i = 0; i < 100; i++) {
      expect(Number.isInteger(rollD6())).toBe(true)
    }
  })
})
