import type { Entry, Table, TableSet, GeneratedResult, ResultField, Trigger, DieType } from './types'
import { rollDie } from './dice'

export function findEntry(entries: Entry[], roll: number): Entry {
  const entry = entries.find(
    (e) => roll >= e.range[0] && roll <= e.range[1]
  )
  if (!entry) {
    throw new Error(`No entry found for roll value ${roll}`)
  }
  return entry
}

export function rerollSingleField(
  table: Table,
  tableIndex: number,
  rollFn: (die: DieType) => number = rollDie
): ResultField {
  const roll = rollFn(table.die)
  const entry = findEntry(table.entries, roll)
  return {
    tableName: table.name,
    entry: {
      title: entry.title,
      ...(entry.description !== undefined ? { description: entry.description } : {}),
    },
    tableIndex,
  }
}

function rollSingleTable(
  table: Table,
  tableIndex: number,
  rollFn: (die: DieType) => number
): { field: ResultField; entry: Entry } {
  const roll = rollFn(table.die)
  const entry = findEntry(table.entries, roll)
  const field: ResultField = {
    tableName: table.name,
    entry: {
      title: entry.title,
      ...(entry.description !== undefined
        ? { description: entry.description }
        : {}),
    },
    tableIndex,
  }
  return { field, entry }
}

async function resolveTrigger(
  trigger: Trigger,
  currentTableSet: TableSet,
  rollFn: (die: DieType) => number,
  fetchTableSet?: (categoryId: string, fileName: string) => Promise<TableSet>,
  visited?: Set<string>
): Promise<ResultField[]> {
  // Mode 1: same-file trigger (only tableId, no tableSet)
  if (trigger.tableId && !trigger.tableSet) {
    const table = currentTableSet.tables.find((t) => t.id === trigger.tableId)
    if (!table) return [{ tableName: trigger.tableId ?? 'Unknown', entry: { title: 'Error' }, tableIndex: -1, error: `Trigger references unknown table ID: ${trigger.tableId}` }]
    const tableIndex = currentTableSet.tables.indexOf(table)
    const { field } = rollSingleTable(table, tableIndex, rollFn)
    return [field]
  }

  // Cross-file triggers require fetchTableSet
  if (!trigger.tableSet || !fetchTableSet) return []

  const parts = trigger.tableSet.split('/')
  if (parts.length !== 2) return []
  const [categoryId, fileBase] = parts
  const fileName = `${fileBase}.json`
  const tableSetPath = `${categoryId}/${fileName}`

  // Circular reference protection
  if (visited?.has(tableSetPath)) {
    console.warn(`Circular trigger reference detected: ${tableSetPath}. Skipping.`)
    return []
  }
  visited?.add(tableSetPath)

  let fetchedTableSet: TableSet
  try {
    fetchedTableSet = await fetchTableSet(categoryId, fileName)
  } catch {
    return [{
      tableName: trigger.tableSet ?? 'Unknown',
      entry: { title: 'Error' },
      tableIndex: -1,
      error: `Failed to load triggered table set: ${trigger.tableSet}`,
    }]
  }

  // Mode 2: cross-file specific table (tableSet + tableId)
  if (trigger.tableId) {
    const table = fetchedTableSet.tables.find((t) => t.id === trigger.tableId)
    if (!table) return [{ tableName: trigger.tableId ?? 'Unknown', entry: { title: 'Error' }, tableIndex: -1, error: `Table ID "${trigger.tableId}" not found in ${trigger.tableSet}` }]
    const tableIndex = fetchedTableSet.tables.indexOf(table)
    const { field } = rollSingleTable(table, tableIndex, rollFn)
    return [field]
  }

  // Mode 3: cross-file entire set (only tableSet, no tableId)
  // Roll all non-conditional tables without recursing into triggers
  const fields: ResultField[] = []
  for (const [index, table] of fetchedTableSet.tables.entries()) {
    if (table.conditional === true) continue
    const { field } = rollSingleTable(table, index, rollFn)
    fields.push(field)
  }
  return fields
}

export async function rerollFieldWithTriggers(
  table: Table,
  tableIndex: number,
  tableSet: TableSet,
  rollFn: (die: DieType) => number = rollDie,
  fetchTableSet?: (categoryId: string, fileName: string) => Promise<TableSet>,
  tableSetPath?: string
): Promise<ResultField[]> {
  const { field, entry } = rollSingleTable(table, tableIndex, rollFn)
  const fields: ResultField[] = [field]

  if (entry.triggers && entry.triggers.length > 0) {
    const visited = new Set<string>()
    if (tableSetPath) visited.add(tableSetPath)

    for (const trigger of entry.triggers) {
      const triggerFields = await resolveTrigger(
        trigger,
        tableSet,
        rollFn,
        fetchTableSet,
        visited
      )
      for (const tf of triggerFields) {
        tf.triggered = true
      }
      fields.push(...triggerFields)
    }
  }

  return fields
}

export async function rollTableSet(
  tableSet: TableSet,
  categoryName: string,
  rollFn: (die: DieType) => number = rollDie,
  fetchTableSet?: (categoryId: string, fileName: string) => Promise<TableSet>,
  tableSetPath?: string
): Promise<GeneratedResult> {
  const visited = new Set<string>()
  if (tableSetPath) {
    visited.add(tableSetPath)
  }

  const fields: ResultField[] = []

  const nonConditionalTables = tableSet.tables
    .map((table, index) => ({ table, index }))
    .filter(({ table }) => table.conditional !== true)

  for (const { table, index } of nonConditionalTables) {
    const { field, entry } = rollSingleTable(table, index, rollFn)
    fields.push(field)

    // Resolve triggers from the rolled entry
    if (entry.triggers && entry.triggers.length > 0) {
      for (const trigger of entry.triggers) {
        const triggerFields = await resolveTrigger(
          trigger,
          tableSet,
          rollFn,
          fetchTableSet,
          visited
        )
        for (const tf of triggerFields) {
          tf.triggered = true
        }
        fields.push(...triggerFields)
      }
    }
  }

  return {
    id: crypto.randomUUID(),
    tableSetName: tableSet.name,
    categoryName,
    fields,
  }
}
