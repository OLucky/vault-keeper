import { describe, it, expect } from 'vitest'
import {
  DieType,
  EntrySchema,
  TableSchema,
  TableSetSchema,
  CategoryIndexSchema,
  ManifestSchema,
  TriggerSchema,
} from '../types'

describe('DieType', () => {
  it('accepts valid die types', () => {
    expect(DieType.parse('d4')).toBe('d4')
    expect(DieType.parse('d6')).toBe('d6')
    expect(DieType.parse('d8')).toBe('d8')
    expect(DieType.parse('d10')).toBe('d10')
    expect(DieType.parse('d12')).toBe('d12')
    expect(DieType.parse('d20')).toBe('d20')
    expect(DieType.parse('d100')).toBe('d100')
  })

  it('rejects invalid die types', () => {
    expect(() => DieType.parse('d3')).toThrow()
    expect(() => DieType.parse('d7')).toThrow()
    expect(() => DieType.parse('coin')).toThrow()
  })
})

describe('TriggerSchema', () => {
  it('accepts trigger with tableId only', () => {
    const result = TriggerSchema.parse({ tableId: 'mutations' })
    expect(result.tableId).toBe('mutations')
  })

  it('accepts trigger with tableSet only', () => {
    const result = TriggerSchema.parse({ tableSet: 'mutations/mutation-generator' })
    expect(result.tableSet).toBe('mutations/mutation-generator')
  })

  it('accepts trigger with both fields', () => {
    const result = TriggerSchema.parse({
      tableSet: 'mutations/mutation-generator',
      tableId: 'physical',
    })
    expect(result.tableSet).toBe('mutations/mutation-generator')
    expect(result.tableId).toBe('physical')
  })

  it('rejects trigger with neither field', () => {
    expect(() => TriggerSchema.parse({})).toThrow()
  })
})

describe('EntrySchema', () => {
  it('accepts a valid entry with range and title', () => {
    const entry = EntrySchema.parse({ range: [1, 3], title: 'Test' })
    expect(entry.range).toEqual([1, 3])
    expect(entry.title).toBe('Test')
  })

  it('accepts an entry with description', () => {
    const entry = EntrySchema.parse({
      range: [1, 1],
      title: 'Test',
      description: 'A description',
    })
    expect(entry.description).toBe('A description')
  })

  it('accepts an entry with triggers', () => {
    const entry = EntrySchema.parse({
      range: [1, 1],
      title: 'Test',
      triggers: [{ tableId: 'mutations' }],
    })
    expect(entry.triggers).toHaveLength(1)
  })

  it('rejects entry missing title', () => {
    expect(() => EntrySchema.parse({ range: [1, 1] })).toThrow()
  })

  it('rejects entry missing range', () => {
    expect(() => EntrySchema.parse({ title: 'Test' })).toThrow()
  })

  it('rejects invalid range format', () => {
    expect(() => EntrySchema.parse({ range: [1], title: 'Test' })).toThrow()
    expect(() => EntrySchema.parse({ range: 'bad', title: 'Test' })).toThrow()
    expect(() =>
      EntrySchema.parse({ range: [1, 2, 3], title: 'Test' })
    ).toThrow()
  })
})

describe('TableSchema', () => {
  it('accepts a valid table', () => {
    const table = TableSchema.parse({
      name: 'Test Table',
      die: 'd6',
      entries: [{ range: [1, 6], title: 'All' }],
    })
    expect(table.name).toBe('Test Table')
    expect(table.die).toBe('d6')
  })

  it('accepts a table with optional id and conditional', () => {
    const table = TableSchema.parse({
      name: 'Test',
      id: 'test-id',
      die: 'd6',
      conditional: true,
      entries: [{ range: [1, 6], title: 'All' }],
    })
    expect(table.id).toBe('test-id')
    expect(table.conditional).toBe(true)
  })

  it('rejects table with invalid die type', () => {
    expect(() =>
      TableSchema.parse({
        name: 'Test',
        die: 'd3',
        entries: [{ range: [1, 3], title: 'All' }],
      })
    ).toThrow()
  })

  it('rejects table missing name', () => {
    expect(() =>
      TableSchema.parse({
        die: 'd6',
        entries: [{ range: [1, 6], title: 'All' }],
      })
    ).toThrow()
  })

  it('rejects table missing entries', () => {
    expect(() =>
      TableSchema.parse({
        name: 'Test',
        die: 'd6',
      })
    ).toThrow()
  })
})

describe('TableSetSchema', () => {
  it('accepts a valid table set', () => {
    const tableSet = TableSetSchema.parse({
      name: 'Generator',
      tables: [
        {
          name: 'Table 1',
          die: 'd6',
          entries: [{ range: [1, 6], title: 'All' }],
        },
      ],
    })
    expect(tableSet.name).toBe('Generator')
    expect(tableSet.tables).toHaveLength(1)
  })

  it('rejects table set missing name', () => {
    expect(() =>
      TableSetSchema.parse({
        tables: [
          {
            name: 'Table 1',
            die: 'd6',
            entries: [{ range: [1, 6], title: 'All' }],
          },
        ],
      })
    ).toThrow()
  })
})

describe('CategoryIndexSchema', () => {
  it('accepts a valid category index', () => {
    const index = CategoryIndexSchema.parse({
      name: 'NPCs',
      tableSets: ['npc-generator.json'],
    })
    expect(index.name).toBe('NPCs')
    expect(index.tableSets).toEqual(['npc-generator.json'])
  })

  it('rejects missing name', () => {
    expect(() =>
      CategoryIndexSchema.parse({ tableSets: ['file.json'] })
    ).toThrow()
  })
})

describe('ManifestSchema', () => {
  it('accepts a valid manifest', () => {
    const manifest = ManifestSchema.parse({
      categories: ['npcs', 'weapons-items'],
    })
    expect(manifest.categories).toEqual(['npcs', 'weapons-items'])
  })

  it('rejects missing categories', () => {
    expect(() => ManifestSchema.parse({})).toThrow()
  })
})
