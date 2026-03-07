import { describe, it, expect, vi } from 'vitest'
import { findEntry, rollTableSet } from '../rolling'
import type { Entry, TableSet, DieType } from '../types'

describe('findEntry', () => {
  const entries: Entry[] = [
    { range: [1, 2], title: 'First' },
    { range: [3, 3], title: 'Second' },
    { range: [4, 6], title: 'Third' },
  ]

  it('returns the entry for a single-result range [3, 3]', () => {
    const result = findEntry(entries, 3)
    expect(result.title).toBe('Second')
  })

  it('returns the entry for a multi-result range [1, 2] — roll of 1', () => {
    const result = findEntry(entries, 1)
    expect(result.title).toBe('First')
  })

  it('returns the entry for a multi-result range [1, 2] — roll of 2', () => {
    const result = findEntry(entries, 2)
    expect(result.title).toBe('First')
  })

  it('throws when no entry matches the roll value', () => {
    expect(() => findEntry(entries, 7)).toThrow('No entry found for roll value 7')
  })
})

describe('rollTableSet', () => {
  const makeTableSet = (tables: TableSet['tables']): TableSet => ({
    name: 'Test Set',
    tables,
  })

  const simpleTable = (name: string, conditional?: boolean) => ({
    name,
    die: 'd4' as DieType,
    ...(conditional !== undefined ? { conditional } : {}),
    entries: [
      { range: [1, 2] as [number, number], title: 'Low', description: 'A low roll' },
      { range: [3, 4] as [number, number], title: 'High' },
    ],
  })

  const mockRollFn = () => 1

  it('produces correct number of fields for 2 non-conditional tables', async () => {
    const tableSet = makeTableSet([simpleTable('Table A'), simpleTable('Table B')])
    const result = await rollTableSet(tableSet, 'Test Category', mockRollFn)

    expect(result.fields).toHaveLength(2)
    expect(result.tableSetName).toBe('Test Set')
    expect(result.categoryName).toBe('Test Category')
    expect(result.fields[0].tableName).toBe('Table A')
    expect(result.fields[0].entry.title).toBe('Low')
    expect(result.fields[1].tableName).toBe('Table B')
    expect(result.fields[1].entry.title).toBe('Low')
  })

  it('skips tables where conditional is true', async () => {
    const tableSet = makeTableSet([
      simpleTable('Table A'),
      simpleTable('Conditional Table', true),
      simpleTable('Table B'),
    ])
    const result = await rollTableSet(tableSet, 'Test Category', mockRollFn)

    expect(result.fields).toHaveLength(2)
    expect(result.fields[0].tableName).toBe('Table A')
    expect(result.fields[1].tableName).toBe('Table B')
  })

  it('each ResultField has a valid tableIndex matching its position in the array', async () => {
    const tableSet = makeTableSet([
      simpleTable('Table A'),
      simpleTable('Conditional Table', true),
      simpleTable('Table B'),
    ])
    const result = await rollTableSet(tableSet, 'Test Category', mockRollFn)

    expect(result.fields[0].tableIndex).toBe(0)
    expect(result.fields[1].tableIndex).toBe(2)
  })

  it('includes description in entry when present', async () => {
    const tableSet = makeTableSet([simpleTable('Table A')])
    const result = await rollTableSet(tableSet, 'Test Category', mockRollFn)

    expect(result.fields[0].entry.description).toBe('A low roll')
  })

  it('generates a unique id', async () => {
    const tableSet = makeTableSet([simpleTable('Table A')])
    const result1 = await rollTableSet(tableSet, 'Test Category', mockRollFn)
    const result2 = await rollTableSet(tableSet, 'Test Category', mockRollFn)

    expect(result1.id).toBeDefined()
    expect(result2.id).toBeDefined()
    expect(result1.id).not.toBe(result2.id)
  })
})

describe('rollTableSet triggers', () => {
  const mockRollFn = () => 1

  it('conditional tables are skipped when not triggered', async () => {
    const tableSet: TableSet = {
      name: 'Test Set',
      tables: [
        {
          name: 'Main',
          die: 'd4',
          entries: [
            { range: [1, 2], title: 'Normal Entry' },
            { range: [3, 4], title: 'Trigger Entry', triggers: [{ tableId: 'hidden' }] },
          ],
        },
        {
          name: 'Hidden Table',
          id: 'hidden',
          die: 'd4',
          conditional: true,
          entries: [
            { range: [1, 4], title: 'Hidden Result' },
          ],
        },
      ],
    }

    // Roll of 1 hits "Normal Entry" which has no triggers
    const result = await rollTableSet(tableSet, 'Cat', mockRollFn)
    expect(result.fields).toHaveLength(1)
    expect(result.fields[0].tableName).toBe('Main')
    expect(result.fields[0].entry.title).toBe('Normal Entry')
  })

  it('trigger mode 1 (same-file): rolls conditional table when triggered', async () => {
    const tableSet: TableSet = {
      name: 'Test Set',
      tables: [
        {
          name: 'Main',
          die: 'd4',
          entries: [
            { range: [1, 2], title: 'Trigger Entry', triggers: [{ tableId: 'bonus' }] },
            { range: [3, 4], title: 'Normal' },
          ],
        },
        {
          name: 'Bonus Table',
          id: 'bonus',
          die: 'd4',
          conditional: true,
          entries: [
            { range: [1, 2], title: 'Bonus Result', description: 'A bonus' },
            { range: [3, 4], title: 'Other Bonus' },
          ],
        },
      ],
    }

    // Roll of 1 hits "Trigger Entry" which triggers 'bonus' table
    const result = await rollTableSet(tableSet, 'Cat', mockRollFn)
    expect(result.fields).toHaveLength(2)
    expect(result.fields[0].tableName).toBe('Main')
    expect(result.fields[0].entry.title).toBe('Trigger Entry')
    expect(result.fields[1].tableName).toBe('Bonus Table')
    expect(result.fields[1].entry.title).toBe('Bonus Result')
    expect(result.fields[1].entry.description).toBe('A bonus')
  })

  it('trigger mode 2 (cross-file specific table): fetches and rolls specific table', async () => {
    const tableSet: TableSet = {
      name: 'Test Set',
      tables: [
        {
          name: 'Main',
          die: 'd4',
          entries: [
            {
              range: [1, 4],
              title: 'Trigger Entry',
              triggers: [{ tableSet: 'mutations/mutation-generator', tableId: 'physical' }],
            },
          ],
        },
      ],
    }

    const fetchedTableSet: TableSet = {
      name: 'Mutation Generator',
      tables: [
        {
          name: 'Physical Mutations',
          id: 'physical',
          die: 'd4',
          entries: [
            { range: [1, 2], title: 'Extra Arm' },
            { range: [3, 4], title: 'Scales' },
          ],
        },
        {
          name: 'Mental Mutations',
          id: 'mental',
          die: 'd4',
          entries: [
            { range: [1, 4], title: 'Telepathy' },
          ],
        },
      ],
    }

    const mockFetch = vi.fn().mockResolvedValue(fetchedTableSet)

    const result = await rollTableSet(tableSet, 'Cat', mockRollFn, mockFetch)
    expect(mockFetch).toHaveBeenCalledWith('mutations', 'mutation-generator.json')
    expect(result.fields).toHaveLength(2)
    expect(result.fields[1].tableName).toBe('Physical Mutations')
    expect(result.fields[1].entry.title).toBe('Extra Arm')
  })

  it('trigger mode 3 (cross-file entire set): fetches and rolls all non-conditional tables', async () => {
    const tableSet: TableSet = {
      name: 'Test Set',
      tables: [
        {
          name: 'Main',
          die: 'd4',
          entries: [
            {
              range: [1, 4],
              title: 'Trigger Entry',
              triggers: [{ tableSet: 'mutations/mutation-generator' }],
            },
          ],
        },
      ],
    }

    const fetchedTableSet: TableSet = {
      name: 'Mutation Generator',
      tables: [
        {
          name: 'Physical Mutations',
          die: 'd4',
          entries: [
            { range: [1, 2], title: 'Extra Arm' },
            { range: [3, 4], title: 'Scales' },
          ],
        },
        {
          name: 'Mental Mutations',
          die: 'd4',
          entries: [
            { range: [1, 4], title: 'Telepathy' },
          ],
        },
        {
          name: 'Conditional Table',
          die: 'd4',
          conditional: true,
          entries: [
            { range: [1, 4], title: 'Should Be Skipped' },
          ],
        },
      ],
    }

    const mockFetch = vi.fn().mockResolvedValue(fetchedTableSet)

    const result = await rollTableSet(tableSet, 'Cat', mockRollFn, mockFetch)
    expect(mockFetch).toHaveBeenCalledWith('mutations', 'mutation-generator.json')
    // Main field + 2 non-conditional from fetched set (conditional skipped)
    expect(result.fields).toHaveLength(3)
    expect(result.fields[0].entry.title).toBe('Trigger Entry')
    expect(result.fields[1].tableName).toBe('Physical Mutations')
    expect(result.fields[1].entry.title).toBe('Extra Arm')
    expect(result.fields[2].tableName).toBe('Mental Mutations')
    expect(result.fields[2].entry.title).toBe('Telepathy')
  })

  it('circular reference protection: skips already-visited table sets', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const tableSet: TableSet = {
      name: 'Test Set',
      tables: [
        {
          name: 'Main',
          die: 'd4',
          entries: [
            {
              range: [1, 4],
              title: 'Trigger Entry',
              triggers: [{ tableSet: 'self/self-ref' }],
            },
          ],
        },
      ],
    }

    const mockFetch = vi.fn().mockResolvedValue(tableSet)

    // The current table set path is 'self/self-ref.json', same as the trigger target
    const result = await rollTableSet(tableSet, 'Cat', mockRollFn, mockFetch, 'self/self-ref.json')

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Circular trigger reference detected')
    )
    // Only the main field, trigger was skipped
    expect(result.fields).toHaveLength(1)
    expect(mockFetch).not.toHaveBeenCalled()

    warnSpy.mockRestore()
  })

  it('cross-file triggers are skipped when fetchTableSet is not provided', async () => {
    const tableSet: TableSet = {
      name: 'Test Set',
      tables: [
        {
          name: 'Main',
          die: 'd4',
          entries: [
            {
              range: [1, 4],
              title: 'Trigger Entry',
              triggers: [{ tableSet: 'other/other-set', tableId: 'something' }],
            },
          ],
        },
      ],
    }

    const result = await rollTableSet(tableSet, 'Cat', mockRollFn)
    // Only main field, cross-file trigger skipped
    expect(result.fields).toHaveLength(1)
  })
})
