import type { DieType } from './types'
import { DIE_MAX } from './types'

export function rollDie(die: DieType): number {
  const max = DIE_MAX[die]
  return Math.floor(Math.random() * max) + 1
}
