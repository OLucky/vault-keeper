import type { DieType } from './types'
import { getDieMax } from './types'

export function rollDie(die: DieType): number {
  const max = getDieMax(die)
  return Math.floor(Math.random() * max) + 1
}

export function rollComputed(dice: string, method: string): number {
  const match = dice.match(/^(\d+)d(\d+)$/)
  if (!match) {
    throw new Error(`Invalid dice format: "${dice}". Expected format "NdX" (e.g., 3d6)`)
  }

  const count = parseInt(match[1], 10)
  const sides = parseInt(match[2], 10)

  const rolls: number[] = []
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1)
  }

  switch (method) {
    case 'lowest':
      return Math.min(...rolls)
    default:
      throw new Error(`Unknown compute method: "${method}"`)
  }
}
