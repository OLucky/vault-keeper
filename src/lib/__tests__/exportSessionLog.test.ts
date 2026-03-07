import { describe, it, expect } from 'vitest'
import { formatSessionLogAsText } from '../exportSessionLog'
import type { SessionLogEntry } from '../../stores/sessionLogStore'

function makeEntry(overrides: Partial<SessionLogEntry> = {}): SessionLogEntry {
  return {
    id: 'test-id',
    timestamp: 1000,
    categoryId: 'cat-1',
    categoryName: 'NPCs',
    tableSetName: 'Vaarn NPC Generator',
    fields: [
      { tableName: 'Name', entry: { title: 'Zara' }, tableIndex: 0 },
      { tableName: 'Trait', entry: { title: 'Paranoid' }, tableIndex: 1 },
    ],
    ...overrides,
  }
}

describe('formatSessionLogAsText', () => {
  it('empty log returns empty string', () => {
    expect(formatSessionLogAsText([])).toBe('')
  })

  it('single entry formats with header and indented field line', () => {
    const result = formatSessionLogAsText([makeEntry()])
    expect(result).toBe(
      'NPCs — Vaarn NPC Generator\n' +
      '  Name: Zara, Trait: Paranoid'
    )
  })

  it('multiple groups produce separate sections with blank line between', () => {
    const entries = [
      makeEntry({ categoryId: 'cat-1', categoryName: 'NPCs', tableSetName: 'NPC Gen', timestamp: 2000 }),
      makeEntry({ categoryId: 'cat-2', categoryName: 'Weapons', tableSetName: 'Weapon Gen', timestamp: 1000, id: 'w1',
        fields: [{ tableName: 'Type', entry: { title: 'Blade' }, tableIndex: 0 }],
      }),
    ]
    const result = formatSessionLogAsText(entries)
    const sections = result.split('\n\n')
    expect(sections).toHaveLength(2)
    expect(sections[0]).toContain('NPCs — NPC Gen')
    expect(sections[1]).toContain('Weapons — Weapon Gen')
  })

  it('entries with descriptions show title and description', () => {
    const entry = makeEntry({
      fields: [
        { tableName: 'Weapon', entry: { title: 'Blade', description: 'A sharp glass sword' }, tableIndex: 0 },
      ],
    })
    const result = formatSessionLogAsText([entry])
    expect(result).toContain('Weapon: Blade — A sharp glass sword')
  })

  it('entries with errors show error text', () => {
    const entry = makeEntry({
      fields: [
        { tableName: 'Name', entry: { title: '' }, tableIndex: 0, error: 'Table not found' },
      ],
    })
    const result = formatSessionLogAsText([entry])
    expect(result).toContain('Name: Table not found')
  })

  it('entries ordered newest first within group', () => {
    const entries = [
      makeEntry({ id: 'old', timestamp: 1000,
        fields: [{ tableName: 'Name', entry: { title: 'Kael' }, tableIndex: 0 }],
      }),
      makeEntry({ id: 'new', timestamp: 2000,
        fields: [{ tableName: 'Name', entry: { title: 'Zara' }, tableIndex: 0 }],
      }),
    ]
    const result = formatSessionLogAsText(entries)
    const lines = result.split('\n')
    const entryLines = lines.filter((l) => l.startsWith('  '))
    expect(entryLines[0]).toContain('Zara')
    expect(entryLines[1]).toContain('Kael')
  })
})
