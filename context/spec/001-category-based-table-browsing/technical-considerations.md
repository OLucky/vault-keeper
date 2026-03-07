# Technical Specification: Phase 1 — Roll & Generate

**Functional Specifications:**
- `context/spec/001-category-based-table-browsing/functional-spec.md`
- `context/spec/002-one-click-rolling/functional-spec.md`
- `context/spec/003-json-driven-table-data/functional-spec.md`

**Status:** Completed
**Author(s):** Poe

---

## 1. High-Level Technical Approach

Phase 1 is a greenfield Vite + React + TypeScript SPA with three layers:

1. **Data layer** — Zod-validated TypeScript types matching the JSON schema. TanStack Query handles fetching and caching JSON files from `/public/tables/`. A single Zustand store manages ephemeral roll state (recent rolls, stacked results).
2. **Logic layer** — A pure rolling engine (`rollTableSet`, `rollSingleTable`, `rerollField`) that handles die generation, range lookup, conditional tables, and lazy cross-file trigger resolution.
3. **UI layer** — TanStack Router with two routes (dashboard, category page). React Aria Components for accessible interactive primitives. CSS Modules with modern CSS for styling.

No backend, no database, no authentication. The entire app runs in the browser.

---

## 2. Proposed Solution & Implementation Plan

### 2.1. Project Setup & Dependencies

| Dependency | Purpose |
|---|---|
| `vite` | Build tool |
| `react`, `react-dom` | UI framework |
| `typescript` | Language |
| `@tanstack/react-router` | File-based, type-safe routing |
| `@tanstack/react-query` | Data fetching, caching, error/loading states |
| `zustand` | State management (roll state) |
| `react-aria-components` | Accessible UI primitives (Button, TextField, Link) |
| `zod` | Runtime JSON validation + type inference |
| `vitest` | Unit testing |
| `@testing-library/react` | Component testing |

### 2.2. File Structure

```
src/
  routes/
    __root.tsx          # Root layout (app shell, navigation)
    index.tsx           # Dashboard (home page)
    $categoryId.tsx     # Category page (dynamic route)
  components/
    CategoryCard/       # Category name card (dashboard)
    TableSetEntry/      # Table set name + Roll button + stacked results
    ResultCard/         # Single generated result with labeled fields
    RerollButton/       # Per-field re-roll icon button
    ErrorMessage/       # User-friendly inline error display
    FilterInput/        # Text filter for table set search
  lib/
    types.ts            # Zod schemas + inferred TypeScript types
    rolling.ts          # Pure rolling engine functions
    loader.ts           # TanStack Query query functions for JSON fetching
    validation.ts       # Zod parse + error formatting helpers
    dice.ts             # Die utilities (parse die string, generate random roll)
  stores/
    rollStore.ts        # Zustand store: recentRolls, stackedResults
  styles/
    global.css          # CSS custom properties, reset, base styles
  main.tsx              # App entry point (router + query client setup)
public/
  tables/
    manifest.json
    npcs/
      index.json
      npc-generator.json
      npc-background.json
    weapons-items/
      index.json
      weapon-generator.json
      trade-goods.json
```

### 2.3. Data Model (Zod Schemas -> TypeScript Types)

Defined in `src/lib/types.ts`. Zod schemas are the single source of truth; TypeScript types are inferred via `z.infer<>`.

**Key schemas:**

| Schema | Fields | Purpose |
|---|---|---|
| `ManifestSchema` | `categories: string[]` | Root manifest listing category folder names |
| `CategoryIndexSchema` | `name: string`, `tableSets: string[]` | Category metadata + table set file list |
| `TriggerSchema` | `tableSet?: string`, `tableId?: string` | Trigger reference (3 modes) |
| `EntrySchema` | `range: [number, number]`, `title: string`, `description?: string`, `triggers?: TriggerSchema[]` | Single table entry |
| `TableSchema` | `name: string`, `id?: string`, `die: DieType`, `conditional?: boolean`, `entries: EntrySchema[]` | Individual random table |
| `TableSetSchema` | `name: string`, `tables: TableSchema[]` | Complete table set file |

`DieType` is a Zod enum: `"d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100"`.

A `DIE_MAX` map converts die strings to max values: `{ d4: 4, d6: 6, d8: 8, d10: 10, d12: 12, d20: 20, d100: 100 }`.

### 2.4. Data Fetching (TanStack Query)

Defined in `src/lib/loader.ts`. Each fetch parses through Zod for validation.

| Query Key | Fetches | Returns |
|---|---|---|
| `["manifest"]` | `/tables/manifest.json` | `Manifest` (list of category folder names) |
| `["category", categoryId]` | `/tables/{categoryId}/index.json` | `CategoryIndex` (name + table set file list) |
| `["tableSet", categoryId, fileName]` | `/tables/{categoryId}/{fileName}` | `TableSet` (full table set data, validated) |

- **Manifest** is fetched once on app startup (stale time: Infinity).
- **Category indexes** are fetched when the dashboard loads (prefetched for all categories listed in the manifest).
- **Table sets** are fetched when a category page loads (all table sets for that category). Lazy-fetched for cross-file triggers.
- On Zod validation failure, the query returns a structured error object with a human-readable message. The UI displays this inline via `ErrorMessage` component.

### 2.5. Routing (TanStack Router)

| Route | File | Loader | Description |
|---|---|---|---|
| `/` | `routes/index.tsx` | Fetch manifest + all category indexes | Dashboard with categories list + recent rolls |
| `/$categoryId` | `routes/$categoryId.tsx` | Fetch all table sets for the category | Category page with table set list + inline results |

- `$categoryId` is a dynamic segment matching a category folder name (e.g., `/npcs`, `/weapons-items`).
- Route loaders use `queryClient.ensureQueryData()` to prefetch before render.

### 2.6. State Management (Zustand Store)

Defined in `src/stores/rollStore.ts`.

| State | Type | Description |
|---|---|---|
| `recentRolls` | `GeneratedResult[]` | Last 5 full-roll results across all table sets (dashboard). LIFO. |
| `stackedResults` | `Record<string, GeneratedResult[]>` | Keyed by `categoryId/tableSetFileName`. Max 10 per key. LIFO. |

| Action | Description |
|---|---|
| `addRoll(categoryId, tableSetFileName, result)` | Adds to `stackedResults` (cap at 10) and `recentRolls` (cap at 5). |
| `rerollField(categoryId, tableSetFileName, resultId, tableIndex, newEntry)` | Replaces a single field in a specific result. Updates the entry in both `stackedResults` and `recentRolls`. |
| `clearStacked(categoryId)` | Clears all stacked results for a given category (called on route exit). |

`GeneratedResult` contains a unique `id`, the `tableSetName`, `categoryName`, and an array of `ResultField` objects (each with `tableName`, `entry: { title, description? }`, and a reference to the source table for re-rolling).

### 2.7. Rolling Engine

Defined in `src/lib/rolling.ts` and `src/lib/dice.ts`. Pure functions with no side effects (except lazy fetching for triggers).

**`rollDie(die: DieType): number`** — Returns a random integer from 1 to the die's max using `Math.random()`.

**`findEntry(entries: Entry[], roll: number): Entry`** — Finds the entry whose `range` includes the given roll value.

**`rollTableSet(tableSet: TableSet, fetchTableSet: FetchFn): Promise<GeneratedResult>`**
1. Iterate through `tables` where `conditional` is not `true`.
2. For each table: roll the die, find the matching entry, add to result fields.
3. For each selected entry with `triggers`: resolve each trigger.
   - Same-file table trigger: find the table by `id` in the current table set, roll it.
   - Cross-file trigger: call `fetchTableSet(path)` to lazy-load (TanStack Query cache ensures instant on subsequent calls), then roll the specific table or all non-conditional tables.
4. Return the assembled `GeneratedResult`.

**`rerollSingleField(table: Table): ResultField`** — Rolls a single table and returns the new field. Used for per-field re-roll.

### 2.8. Component Breakdown

| Component | Responsibility | Key Props |
|---|---|---|
| `CategoryCard` | Displays category name, links to category page | `name`, `categoryId` |
| `TableSetEntry` | Table set name + Roll button + stacked results list | `tableSet`, `categoryId` |
| `ResultCard` | Displays a single generated result with labeled fields | `result: GeneratedResult` |
| `RerollButton` | Small icon button next to each field, triggers per-field re-roll | `onReroll()` |
| `FilterInput` | Text input that filters table set list by name | `value`, `onChange` |
| `ErrorMessage` | Displays user-friendly validation/fetch error inline | `message: string` |

- `TableSetEntry` manages its own roll action: calls `rollTableSet()`, dispatches to Zustand store.
- `ResultCard` renders each `ResultField` as a labeled row with a `RerollButton`.
- `FilterInput` uses React Aria's `TextField` for accessibility.
- Buttons use React Aria's `Button` component.

---

## 3. Impact and Risk Analysis

**System Dependencies:** None — this is a greenfield project with no external services.

**Potential Risks & Mitigations:**

| Risk | Mitigation |
|---|---|
| Cross-file triggers create circular references (table A triggers table B which triggers table A) | Add a visited-set during trigger resolution. If a table set is already being resolved, skip it and log a validation warning. |
| Large d100 tables with many entries slow down validation | Zod parsing is fast for this data size. If needed, defer validation to first use rather than on fetch. |
| Malformed JSON in `/public` crashes the app | Every fetch is wrapped in try/catch with Zod `.safeParse()`. Errors are caught and displayed inline per-component, not propagated to the app level. |
| `Math.random()` is not cryptographically secure | Acceptable for a dice roller. No security implications. |

---

## 4. Testing Strategy

**Unit tests (Vitest):**

| Module | What to test |
|---|---|
| `dice.ts` | `rollDie` returns values within valid range for each die type. |
| `rolling.ts` | `findEntry` correctly matches ranges. `rollTableSet` generates results with correct number of fields. Conditional tables only appear when triggered. Cross-file triggers resolve correctly (mock fetch). |
| `validation.ts` / `types.ts` | Zod schemas accept valid JSON, reject invalid JSON with clear errors. Range coverage validation (gaps, overlaps). |

**Component tests (Vitest + React Testing Library):**

| Component | What to test |
|---|---|
| `ResultCard` | Renders labeled fields. Shows description when present, omits when absent. |
| `TableSetEntry` | Roll button click produces inline result. Re-roll replaces single field. Max 10 stacked results enforced. |
| `FilterInput` | Typing filters the list. Clearing restores full list. |
| `CategoryPage` | Displays table sets for a category. Back navigation works. |
