import type { SavedResult } from "../stores/savedResultsStore";

interface Group {
  key: string;
  categoryName: string;
  tableSetName: string;
  entries: SavedResult[];
  latestTimestamp: number;
}

function formatField(field: {
  tableName: string;
  entry: { title: string; description?: string };
  error?: string;
}): string {
  if (field.error) {
    return `${field.tableName}: ${field.error}`;
  }
  const value = field.entry.description
    ? `${field.entry.title} — ${field.entry.description}`
    : field.entry.title;
  return `${field.tableName}: ${value}`;
}

export function formatSavedResultsAsText(results: SavedResult[]): string {
  if (results.length === 0) return "";

  const groupMap = new Map<string, Group>();

  for (const result of results) {
    const key = `${result.categoryId}::${result.tableSetName}`;
    const existing = groupMap.get(key);
    if (existing) {
      existing.entries.push(result);
      if (result.savedAt > existing.latestTimestamp) {
        existing.latestTimestamp = result.savedAt;
      }
    } else {
      groupMap.set(key, {
        key,
        categoryName: result.categoryName,
        tableSetName: result.tableSetName,
        entries: [result],
        latestTimestamp: result.savedAt,
      });
    }
  }

  const groups = Array.from(groupMap.values()).sort(
    (a, b) => b.latestTimestamp - a.latestTimestamp,
  );

  return groups
    .map((group) => {
      const header = `${group.categoryName} — ${group.tableSetName}`;
      const sortedEntries = [...group.entries].sort((a, b) => b.savedAt - a.savedAt);
      const lines = sortedEntries.map((entry) => {
        const fieldParts = entry.fields.map(formatField);
        const fieldLine = `  ${fieldParts.join(", ")}`;
        if (entry.note) {
          return `${fieldLine}\n  Note: ${entry.note}`;
        }
        return fieldLine;
      });
      return [header, ...lines].join("\n");
    })
    .join("\n\n");
}
