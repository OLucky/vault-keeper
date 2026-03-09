# Technical Specification: Session Log

- **Functional Specification:** `context/spec/004-session-log/functional-spec.md`
- **Status:** Completed
- **Author(s):** Claude (with GM input)

---

## 1. High-Level Technical Approach

The Session Log is implemented as a **new Zustand store** (`sessionLogStore`) with the `persist` middleware backed by `localStorage`. When the user rolls on a table set, the existing `TableSetEntry` component dispatches the result to both the `rollStore` (existing, for in-view stacking) and the new `sessionLogStore` (for persistent logging).

The UI is a **collapsible sidebar panel** rendered in the root layout (`__root.tsx`). The root layout changes from a single-column flex layout to a layout with a main content area and an adjacent sidebar that pushes the content when open. A toggle button in the header controls sidebar visibility, with a badge indicator for unseen entries.

Export is handled by a pure utility function that formats the store data as plain text with headers.

**Architecture doc update needed:** `context/product/architecture.md` Section 2 should be updated to reflect that Session Log uses `localStorage` via Zustand `persist` middleware (not in-memory only).

---

## 2. Proposed Solution & Implementation Plan (The "How")

### 2.1 Data Model — Session Log Store

**New file:** `src/stores/sessionLogStore.ts`

The store manages a flat array of log entries, each referencing its source category and table set. Grouping and ordering are derived at render time, not stored.

| Field | Type | Description |
|---|---|---|
| `entries` | `SessionLogEntry[]` | All logged results |
| `sidebarOpen` | `boolean` | Whether the sidebar is currently visible |
| `unseenCount` | `number` | Count of entries added while sidebar was closed |

**`SessionLogEntry` shape:**

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique ID (reuse the `GeneratedResult.id`) |
| `timestamp` | `number` | `Date.now()` at time of logging |
| `categoryId` | `string` | Source category slug (e.g., `"npcs"`) |
| `categoryName` | `string` | Display name (e.g., `"NPCs"`) |
| `tableSetName` | `string` | Display name of the table set |
| `fields` | `ResultField[]` | The generated result fields (same shape as existing) |

**Store actions:**

| Action | Description |
|---|---|
| `addEntry(result: GeneratedResult, categoryId: string)` | Adds a new entry with timestamp. Increments `unseenCount` if sidebar is closed. |
| `removeEntry(id: string)` | Removes a single entry by ID. |
| `clearAll()` | Removes all entries and resets count. |
| `toggleSidebar()` | Toggles `sidebarOpen`. Resets `unseenCount` to 0 when opening. |
| `openSidebar()` | Opens sidebar and resets `unseenCount`. |

**Persistence:** Uses Zustand `persist` middleware with key `"vault-keeper-session-log"`. The `sidebarOpen` and `unseenCount` fields should be excluded from persistence via `partialize` (only `entries` persists).

### 2.2 Integration Point — TableSetEntry

**Modified file:** `src/components/TableSetEntry/TableSetEntry.tsx`

In the `handleRoll` function, after `addRoll(storeKey, result)`, add a call to `sessionLogStore.getState().addEntry(result, categoryId)`. This keeps the two stores fully decoupled — no subscriptions, no middleware coupling.

### 2.3 Component Breakdown

**New components:**

| Component | File | Responsibility |
|---|---|---|
| `SessionLogSidebar` | `src/components/SessionLogSidebar/SessionLogSidebar.tsx` | Top-level sidebar container. Renders header (with count, clear, export actions) and the grouped entry list. |
| `SessionLogGroup` | `src/components/SessionLogSidebar/SessionLogGroup.tsx` | Renders a single category → table set group with its heading and entries. |
| `SessionLogEntry` | `src/components/SessionLogSidebar/SessionLogEntry.tsx` | Renders a single log entry with its fields and a delete button. Reuses the same field display pattern as `ResultCard`. |
| `SidebarToggle` | `src/components/SidebarToggle/SidebarToggle.tsx` | Button in the header that toggles the sidebar. Shows unseen count badge when sidebar is closed and new entries exist. |

**Styling:** Each component gets a co-located CSS Module (`.module.css`).

### 2.4 Layout Changes

**Modified file:** `src/routes/__root.tsx`

The root layout changes from:
```
header → main
```
to:
```
header → [main | sidebar]
```

The `<main>` and `<SessionLogSidebar>` sit in a horizontal flex container. When the sidebar is closed, main takes full width. When open, the sidebar takes a fixed width (e.g., `320px`) and main shrinks accordingly.

The `SidebarToggle` button is added to the `<nav>` in the header.

**Modified file:** `src/routes/Root.module.css`

Add styles for the new horizontal flex container wrapping main + sidebar.

### 2.5 Grouping & Ordering Logic

Grouping is computed at render time in `SessionLogSidebar` using a derived selector or `useMemo`:

1. Group entries by a composite key: `${categoryId}/${tableSetName}`
2. Within each group, entries are ordered by `timestamp` descending (newest first)
3. Groups are ordered by the most recent `timestamp` of their entries (most recently active group first)

### 2.6 Export Utility

**New file:** `src/lib/exportSessionLog.ts`

A pure function `formatSessionLogAsText(entries: SessionLogEntry[]): string` that:
1. Groups and orders entries (same logic as the sidebar)
2. Produces plain text with category/table set headers and results listed underneath

Example output:
```
NPCs — Vaarn NPC Generator
  Name: Zara, Trait: Paranoid, Motivation: Revenge
  Name: Kael, Trait: Curious, Motivation: Knowledge

Weapons/Items — Weapon Generator
  Type: Blade, Material: Glass, Quirk: Hums softly
```

Two UI actions use this function:
- **Copy to Clipboard:** Calls `navigator.clipboard.writeText(text)` and shows a brief "Copied!" confirmation.
- **Download:** Creates a `Blob`, generates an object URL, and triggers a download via a temporary `<a>` element.

---

## 3. Impact and Risk Analysis

### System Dependencies

- **`rollStore`** — not modified, but `TableSetEntry` now also dispatches to `sessionLogStore`. If session log store is removed in the future, only the dispatch call needs to be removed.
- **Root layout** — layout structure changes, which affects all pages. CSS changes must be tested across all routes (dashboard, category page).
- **`GeneratedResult` type** — reused as-is. The `categoryName` field already exists on `GeneratedResult`, so no type changes needed.

### Potential Risks & Mitigations

| Risk | Mitigation |
|---|---|
| **localStorage size limits** (~5–10MB) | Session log entries are small (text only). Even hundreds of entries would be well under 100KB. No immediate concern, but a future enhancement could add a max entry cap. |
| **Sidebar layout breaking existing pages** | The sidebar is rendered at the root level and is independent of route content. Test on both the dashboard and category pages. |
| **Performance with many entries** | Grouping/sorting in `useMemo` with `entries` as dependency. For realistic session sizes (tens of entries), this is negligible. |
| **persist middleware hydration flash** | Zustand `persist` hydrates asynchronously. Use `onRehydrateStorage` or the `hasHydrated` pattern if needed to avoid a flash of empty state on load. |

---

## 4. Testing Strategy

- **Store unit tests** (`sessionLogStore.test.ts`): Test `addEntry`, `removeEntry`, `clearAll`, `toggleSidebar`, unseen count logic, and persistence/hydration.
- **Export unit tests** (`exportSessionLog.test.ts`): Test text formatting with various groupings, empty log, single entry, and entries with descriptions.
- **Component tests** (`SessionLogSidebar.test.tsx`): Test that entries render grouped and ordered correctly, delete removes an entry, clear shows confirmation and removes all, sidebar toggle works, and badge appears for unseen entries.
- **Integration test**: Test that rolling in `TableSetEntry` adds an entry to the session log sidebar.
