import type { HexCell } from './weatherGrid'
import { Direction, isEdgeBlocked } from './weatherGrid'

const EVEN_ROW_OFFSETS: Record<Direction, { dr: number; dc: number }> = {
  [Direction.UpperLeft]: { dr: -1, dc: -1 },
  [Direction.UpperRight]: { dr: -1, dc: 0 },
  [Direction.Right]: { dr: 0, dc: 1 },
  [Direction.LowerRight]: { dr: 1, dc: 0 },
  [Direction.LowerLeft]: { dr: 1, dc: -1 },
  [Direction.Left]: { dr: 0, dc: -1 },
}

const ODD_ROW_OFFSETS: Record<Direction, { dr: number; dc: number }> = {
  [Direction.UpperLeft]: { dr: -1, dc: 0 },
  [Direction.UpperRight]: { dr: -1, dc: 1 },
  [Direction.Right]: { dr: 0, dc: 1 },
  [Direction.LowerRight]: { dr: 1, dc: 1 },
  [Direction.LowerLeft]: { dr: 1, dc: 0 },
  [Direction.Left]: { dr: 0, dc: -1 },
}

export function getNeighborCoords(
  row: number,
  col: number,
  direction: Direction,
): { row: number; col: number } {
  const offsets = row % 2 === 0 ? EVEN_ROW_OFFSETS : ODD_ROW_OFFSETS
  const { dr, dc } = offsets[direction]
  return { row: row + dr, col: col + dc }
}

export function findCell(
  row: number,
  col: number,
  cells: HexCell[],
): HexCell | undefined {
  return cells.find((c) => c.row === row && c.col === col)
}

export function getOppositeDirection(direction: Direction): Direction {
  // 1↔4, 2↔5, 3↔6
  const map: Record<Direction, Direction> = {
    [Direction.UpperLeft]: Direction.LowerRight,
    [Direction.UpperRight]: Direction.LowerLeft,
    [Direction.Right]: Direction.Left,
    [Direction.LowerRight]: Direction.UpperLeft,
    [Direction.LowerLeft]: Direction.UpperRight,
    [Direction.Left]: Direction.Right,
  }
  return map[direction]
}

export function getWrappedHex(
  row: number,
  col: number,
  direction: Direction,
  cells: HexCell[],
): HexCell | undefined {
  const opposite = getOppositeDirection(direction)
  let currentRow = row
  let currentCol = col
  let lastCell = findCell(currentRow, currentCol, cells)

  while (true) {
    const next = getNeighborCoords(currentRow, currentCol, opposite)
    const nextCell = findCell(next.row, next.col, cells)
    if (!nextCell) break
    lastCell = nextCell
    currentRow = next.row
    currentCol = next.col
  }

  return lastCell
}

export function resolveMove(
  row: number,
  col: number,
  direction: Direction,
  cells: HexCell[],
): HexCell {
  const neighbor = getNeighborCoords(row, col, direction)
  const neighborCell = findCell(neighbor.row, neighbor.col, cells)

  if (neighborCell) {
    return neighborCell
  }

  if (isEdgeBlocked(row, col, direction)) {
    return findCell(row, col, cells)!
  }

  const wrapped = getWrappedHex(row, col, direction, cells)
  if (wrapped) {
    return wrapped
  }

  return findCell(row, col, cells)!
}

export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1
}
