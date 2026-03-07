import type { SessionLogEntry } from '../stores/sessionLogStore'

interface Group {
  key: string
  categoryName: string
  tableSetName: string
  entries: SessionLogEntry[]
  latestTimestamp: number
}

function formatField(field: { tableName: string; entry: { title: string; description?: string }; error?: string }): string {
  if (field.error) {
    return `${field.tableName}: ${field.error}`
  }
  const value = field.entry.description
    ? `${field.entry.title} — ${field.entry.description}`
    : field.entry.title
  return `${field.tableName}: ${value}`
}

export function formatSessionLogAsText(entries: SessionLogEntry[]): string {
  if (entries.length === 0) return ''

  const groupMap = new Map<string, Group>()

  for (const entry of entries) {
    const key = `${entry.categoryId}::${entry.tableSetName}`
    const existing = groupMap.get(key)
    if (existing) {
      existing.entries.push(entry)
      if (entry.timestamp > existing.latestTimestamp) {
        existing.latestTimestamp = entry.timestamp
      }
    } else {
      groupMap.set(key, {
        key,
        categoryName: entry.categoryName,
        tableSetName: entry.tableSetName,
        entries: [entry],
        latestTimestamp: entry.timestamp,
      })
    }
  }

  const groups = Array.from(groupMap.values())
    .sort((a, b) => b.latestTimestamp - a.latestTimestamp)

  return groups
    .map((group) => {
      const header = `${group.categoryName} — ${group.tableSetName}`
      const sortedEntries = [...group.entries].sort((a, b) => b.timestamp - a.timestamp)
      const lines = sortedEntries.map((entry) => {
        const fieldParts = entry.fields.map(formatField)
        return `  ${fieldParts.join(', ')}`
      })
      return [header, ...lines].join('\n')
    })
    .join('\n\n')
}
