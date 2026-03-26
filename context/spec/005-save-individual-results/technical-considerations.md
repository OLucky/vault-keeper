# Technical Specification: Save Individual Results

- **Functional Specification:** `context/spec/005-save-individual-results/functional-spec.md`
- **Status:** Completed
- **Author(s):** Claude (with GM input)

---

## 1. High-Level Technical Approach

Save Individual Results is implemented as a **new Zustand store** (`savedResultsStore`) with the `persist` middleware backed by `localStorage`, fully independent from both `rollStore` and `sessionLogStore`.

The **save action** (bookmark icon) is added to the existing `ResultCard` component via optional callback props, making it available everywhere results are displayed (roll view and session log sidebar). A **new route** (`/saved`) renders the dedicated Saved Results page with grouped display, inline note editing, and export actions.

The save/unsave confirmation dialog uses React Aria's `Dialog` component for accessibility.

---

## 2. Proposed Solution & Implementation Plan (The "How")

### 2.1 Data Model — Saved Results Store

**New file:** `src/stores/savedResultsStore.ts`

| Field          | Type            | Description       |
| -------------- | --------------- | ----------------- |
| `savedResults` | `SavedResult[]` | All saved results |

**`SavedResult` shape:**

| Field          | Type            | Description                                                       |
| -------------- | --------------- | ----------------------------------------------------------------- |
| `id`           | `string`        | Unique ID (reuse the `GeneratedResult.id` from the original roll) |
| `savedAt`      | `number`        | `Date.now()` at time of saving                                    |
| `categoryId`   | `string`        | Source category slug                                              |
| `categoryName` | `string`        | Display name of the category                                      |
| `tableSetName` | `string`        | Display name of the table set                                     |
| `fields`       | `ResultField[]` | The generated result fields                                       |
| `note`         | `string`        | Optional user note (empty string if none)                         |

**Store actions:**

| Action                                                    | Description                                                          |
| --------------------------------------------------------- | -------------------------------------------------------------------- |
| `saveResult(result: GeneratedResult, categoryId: string)` | Adds a result to the saved collection with timestamp and empty note. |
| `removeResult(id: string)`                                | Removes a saved result by ID.                                        |
| `updateNote(id: string, note: string)`                    | Updates the note for a saved result.                                 |
| `isSaved(id: string)`                                     | Returns whether a result ID exists in the collection.                |

**Persistence:** Uses Zustand `persist` middleware with key `"vault-keeper-saved-results"`. All fields persist.

### 2.2 ResultCard Enhancement

**Modified file:** `src/components/ResultCard/ResultCard.tsx`

Add optional props to `ResultCardProps`:

| Prop       | Type                         | Description                            |
| ---------- | ---------------------------- | -------------------------------------- |
| `isSaved`  | `boolean`                    | Whether this result is currently saved |
| `onSave`   | `(resultId: string) => void` | Callback to save the result            |
| `onUnsave` | `(resultId: string) => void` | Callback to unsave the result          |

When `onSave`/`onUnsave` are provided, a bookmark icon button renders in the card. The icon state (filled/unfilled) is driven by the `isSaved` prop. Clicking an active bookmark triggers a confirmation dialog before unsaving.

The bookmark button uses React Aria's `ToggleButton` for accessible pressed state semantics.

### 2.3 Integration Points

**`TableSetEntry`** (`src/components/TableSetEntry/TableSetEntry.tsx`):

- Reads `isSaved` from `savedResultsStore` for each stacked result.
- Passes `onSave` and `onUnsave` callbacks to `ResultCard` that call `savedResultsStore.saveResult()` and `savedResultsStore.removeResult()`.

**`SessionLogEntry`** (`src/components/SessionLogSidebar/SessionLogEntry.tsx`):

- Same pattern — reads saved state and passes callbacks to its result display.

### 2.4 Saved Results Page

**New file:** `src/routes/saved.tsx`

A new TanStack Router file-based route at `/saved`. The page:

1. Reads all saved results from `savedResultsStore`
2. Groups them by `categoryId`/`tableSetName` (same grouping logic as session log)
3. Renders each group with a heading and its saved results
4. Each result shows its fields, note (with inline edit), and a delete button
5. Empty state shows a message when no results are saved

**New components:**

| Component          | File                                                   | Responsibility                                                                                                                                      |
| ------------------ | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SavedResultCard`  | `src/components/SavedResultCard/SavedResultCard.tsx`   | Displays a saved result with its fields, inline-editable note, and delete action.                                                                   |
| `InlineNoteEditor` | `src/components/InlineNoteEditor/InlineNoteEditor.tsx` | Click-to-edit text field for the note. Uses React Aria `TextField`. Shows placeholder text ("Add a note...") when empty.                            |
| `ConfirmDialog`    | `src/components/ConfirmDialog/ConfirmDialog.tsx`       | Reusable confirmation dialog using React Aria `Dialog` + `Modal`. Used for both unsave confirmation here and clear-all confirmation in session log. |

### 2.5 Navigation

**Modified file:** `src/routes/__root.tsx`

Add a "Saved" link to the `<nav>` in the header, pointing to `/saved`. This sits alongside the existing "Vault Keeper" logo link.

### 2.6 Export Utility

**New file:** `src/lib/exportSavedResults.ts`

A pure function `formatSavedResultsAsText(results: SavedResult[]): string` that:

1. Groups results by category/table set
2. Produces plain text with headers, result fields, and notes (if present)

Example output:

```
NPCs — Vaarn NPC Generator
  Name: Zara, Trait: Paranoid, Motivation: Revenge
    Note: The merchant from the Vaarn wastes

Weapons/Items — Weapon Generator
  Type: Blade, Material: Glass, Quirk: Hums softly
```

Same copy-to-clipboard and download-as-file pattern as session log export.

---

## 3. Impact and Risk Analysis

### System Dependencies

- **`ResultCard`** — modified with new optional props. Existing usage (without save props) is unaffected due to optional typing.
- **`SessionLogSidebar`** — depends on `savedResultsStore` to show saved state indicators. The two stores are read independently, no coupling.
- **Root layout navigation** — a new link is added to the header nav.
- **`ConfirmDialog`** — shared component that should also be used by the session log's "Clear All" action, replacing any inline confirmation logic.

### Potential Risks & Mitigations

| Risk                                   | Mitigation                                                                                                                                                                                            |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Duplicate saves**                    | The `saveResult` action should check if the ID already exists and no-op if so. The UI prevents this via the `isSaved` check, but the store should be defensive.                                       |
| **Orphaned saved results**             | If the table data JSON changes (table set renamed), saved results still display correctly because they store the display data, not references.                                                        |
| **localStorage quota**                 | Saved results include notes (user text) but are still small. Hundreds of entries with notes would be well under 1MB.                                                                                  |
| **Result ID collisions across stores** | `GeneratedResult.id` is generated per roll (likely `crypto.randomUUID()`). The same ID is used in `rollStore`, `sessionLogStore`, and `savedResultsStore` to correlate the same result across stores. |

---

## 4. Testing Strategy

- **Store unit tests** (`savedResultsStore.test.ts`): Test `saveResult`, `removeResult`, `updateNote`, `isSaved`, duplicate prevention, and persistence/hydration.
- **ResultCard tests**: Test that bookmark icon renders when save props are provided, toggles visual state, and calls appropriate callbacks.
- **SavedResultCard tests**: Test note display, inline editing, delete with confirmation.
- **ConfirmDialog tests**: Test confirm and cancel flows.
- **Saved page tests** (`SavedPage.test.tsx`): Test grouped rendering, empty state, export actions.
- **Integration test**: Test end-to-end flow — roll a result, save it, verify it appears on the Saved page.
