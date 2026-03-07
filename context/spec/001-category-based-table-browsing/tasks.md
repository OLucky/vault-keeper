# Phase 1 Tasks — Roll & Generate

**Covers specs:** 001 (Category-Based Table Browsing), 002 (One-Click Rolling), 003 (JSON-Driven Table Data)

---

- [x] **Slice 1: Project scaffolding + empty app runs**
  - [x] Initialize Vite + React + TypeScript project with `npm create vite@latest`. **[Agent: general-purpose]**
  - [x] Install all dependencies: `@tanstack/react-router`, `@tanstack/react-query`, `zustand`, `react-aria-components`, `zod`. **[Agent: general-purpose]**
  - [x] Install dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`. **[Agent: general-purpose]**
  - [x] Configure Vitest in `vite.config.ts` (jsdom environment). **[Agent: general-purpose]**
  - [x] Set up TanStack Router: create `__root.tsx` (app shell with basic layout), `index.tsx` (dashboard placeholder), `$categoryId.tsx` (category page placeholder). **[Agent: general-purpose]**
  - [x] Set up TanStack Query: create `QueryClient` in `main.tsx`, wrap app in `QueryClientProvider`. **[Agent: general-purpose]**
  - [x] Set up global CSS: create `src/styles/global.css` with CSS reset, custom properties, and base typography. **[Agent: general-purpose]**
  - [x] Verify: Run `npm run dev` — app starts, renders root layout, and both routes (`/` and `/test`) are navigable. **[Agent: general-purpose]**

---

- [x] **Slice 2: JSON data files + Zod validation**
  - [x] Create file structure under `public/tables/`: `manifest.json`, `npcs/index.json`, `weapons-items/index.json`. **[Agent: general-purpose]**
  - [x] Create minimal placeholder table set files: `npcs/npc-generator.json` (with 1-2 tables, including range-based entries), `weapons-items/weapon-generator.json`. **[Agent: general-purpose]**
  - [x] Define Zod schemas in `src/lib/types.ts`: `ManifestSchema`, `CategoryIndexSchema`, `TriggerSchema`, `EntrySchema`, `TableSchema`, `TableSetSchema`. Include `DieType` enum and `DIE_MAX` map. **[Agent: general-purpose]**
  - [x] Create `src/lib/validation.ts`: helper functions for range coverage validation (no gaps, no overlaps) and human-readable error formatting. **[Agent: general-purpose]**
  - [x] Write unit tests: Zod schemas accept valid JSON samples, reject invalid JSON (missing fields, bad die type, range gaps/overlaps) with clear error messages. **[Agent: general-purpose]**
  - [x] Verify: All unit tests pass via `npx vitest run`. **[Agent: general-purpose]**

---

- [x] **Slice 3: Data fetching layer**
  - [x] Create `src/lib/loader.ts`: TanStack Query query functions for fetching `manifest.json`, category `index.json`, and table set JSON files. Each fetch parses through Zod with `.safeParse()`. **[Agent: general-purpose]**
  - [x] Define query keys: `["manifest"]`, `["category", categoryId]`, `["tableSet", categoryId, fileName]`. Set manifest stale time to Infinity. **[Agent: general-purpose]**
  - [x] On validation failure, return a structured error object with a human-readable message (not a thrown error — allows inline error display). **[Agent: general-purpose]**
  - [x] Write unit tests: mock `fetch` to verify correct URLs are called, Zod parsing is applied, and errors are returned gracefully for malformed JSON. **[Agent: general-purpose]**
  - [x] Verify: All unit tests pass via `npx vitest run`. **[Agent: general-purpose]**

---

- [x] **Slice 4: Dashboard with category list**
  - [x] Update `routes/index.tsx` (dashboard): use route loader with `queryClient.ensureQueryData()` to prefetch manifest + all category indexes. **[Agent: general-purpose]**
  - [x] Create `src/components/CategoryCard/` component: displays category name, renders as a React Aria `Link` navigating to `/$categoryId`. **[Agent: general-purpose]**
  - [x] Render category cards on the dashboard. Filter out categories with zero table sets (where `tableSets` array is empty). **[Agent: general-purpose]**
  - [x] Add placeholder section for "Recent Rolls" (empty for now — will be wired in Slice 10). Section hidden when there are no rolls. **[Agent: general-purpose]**
  - [x] Create `src/components/ErrorMessage/` component: displays a user-friendly error message inline. Use on dashboard if manifest or category index fails to load. **[Agent: general-purpose]**
  - [x] Write component tests: dashboard renders category names from JSON data, hides empty categories, clicking navigates to category route. **[Agent: general-purpose]**
  - [x] Verify: Run `npm run dev` — dashboard shows "NPCs" and "Weapons/Items" cards. Clicking navigates to `/$categoryId`. **[Agent: general-purpose]**

---

- [x] **Slice 5: Category page with table set listing + filter**
  - [x] Update `routes/$categoryId.tsx`: use route loader to fetch all table sets for the category. Display category name as page heading. **[Agent: general-purpose]**
  - [x] Create `src/components/TableSetEntry/` component: displays table set name and a Roll button (non-functional placeholder for now). **[Agent: general-purpose]**
  - [x] Render list of `TableSetEntry` components for each table set in the category. **[Agent: general-purpose]**
  - [x] Create `src/components/FilterInput/` component: React Aria `TextField` that filters the table set list by name (case-insensitive, filters as user types). **[Agent: general-purpose]**
  - [x] Add back/home navigation element (React Aria `Link` to `/`). **[Agent: general-purpose]**
  - [x] Show `ErrorMessage` inline if any table set file fails to load (other table sets still display). **[Agent: general-purpose]**
  - [x] Write component tests: category page renders table set names, filter narrows list, clearing filter restores full list, back link navigates home. **[Agent: general-purpose]**
  - [x] Verify: Run `npm run dev` — navigate to `/npcs`, see table set names with Roll buttons, filter works, back navigation works. **[Agent: general-purpose]**

---

- [x] **Slice 6: Rolling engine (core)**
  - [x] Create `src/lib/dice.ts`: `rollDie(die: DieType): number` — generates random integer from 1 to die max. `DIE_MAX` map for lookup. **[Agent: general-purpose]**
  - [x] Create `src/lib/rolling.ts`: `findEntry(entries: Entry[], roll: number): Entry` — finds entry whose range includes the roll value. **[Agent: general-purpose]**
  - [x] Implement `rollTableSet(tableSet: TableSet): GeneratedResult` — iterates non-conditional tables, rolls each, assembles result with unique ID, table set name, and array of `ResultField` objects. **[Agent: general-purpose]**
  - [x] Define `GeneratedResult` and `ResultField` types in `types.ts`: `id: string`, `tableSetName: string`, `categoryName: string`, `fields: ResultField[]`. Each `ResultField` has `tableName`, `entry: { title, description? }`, and source table reference. **[Agent: general-purpose]**
  - [x] Write unit tests: `rollDie` returns values in valid range for each die type (run many iterations). `findEntry` correctly matches single and multi-result ranges. `rollTableSet` generates correct number of fields for non-conditional tables only. **[Agent: general-purpose]**
  - [x] Verify: All unit tests pass via `npx vitest run`. **[Agent: general-purpose]**

---

- [x] **Slice 7: Inline results + Zustand store**
  - [x] Create `src/stores/rollStore.ts`: Zustand store with `recentRolls: GeneratedResult[]` (max 5), `stackedResults: Record<string, GeneratedResult[]>` (max 10 per key). Actions: `addRoll`, `clearStacked`. **[Agent: general-purpose]**
  - [x] Create `src/components/ResultCard/` component: renders a single `GeneratedResult` as labeled fields (`tableName: title — description`). **[Agent: general-purpose]**
  - [x] Wire Roll button in `TableSetEntry`: on click, call `rollTableSet()`, dispatch `addRoll` to store. Display stacked results inline below the entry (newest first). **[Agent: general-purpose]**
  - [x] Enforce max 10 stacked results per table set — oldest removed when exceeded. **[Agent: general-purpose]**
  - [x] Clear stacked results when navigating away from the category page (call `clearStacked` on route exit). **[Agent: general-purpose]**
  - [x] Write component tests: Roll button produces inline result. Multiple rolls stack newest first. 11th roll removes oldest. Navigating away clears results. **[Agent: general-purpose]**
  - [x] Verify: Run `npm run dev` — click Roll on a table set, see inline result with labeled fields. Roll again, see stacked results. Navigate away and back — results cleared. **[Agent: general-purpose]**

---

- [x] **Slice 8: Per-field re-roll**
  - [x] Implement `rerollSingleField(table: Table): ResultField` in `rolling.ts` — rolls a single table and returns a new field. **[Agent: general-purpose]**
  - [x] Add `rerollField` action to Zustand store: replaces a specific field in a specific result (by result ID and table index) in both `stackedResults` and `recentRolls`. **[Agent: general-purpose]**
  - [x] Create `src/components/RerollButton/` component: small React Aria `Button` (icon button) placed next to each field in `ResultCard`. **[Agent: general-purpose]**
  - [x] Wire RerollButton: on click, call `rerollSingleField()` with the source table, dispatch `rerollField` to store. Field updates in place. **[Agent: general-purpose]**
  - [x] Write component tests: re-roll button replaces only the targeted field. Other fields unchanged. Store reflects updated field. **[Agent: general-purpose]**
  - [x] Verify: Run `npm run dev` — generate a result, click re-roll on one field, only that field changes. **[Agent: general-purpose]**

---

- [x] **Slice 9: Conditional tables + triggers**
  - [x] Extend `rollTableSet` in `rolling.ts`: after rolling non-conditional tables, check each selected entry for `triggers`. Resolve each trigger according to its mode. **[Agent: general-purpose]**
  - [x] Implement trigger mode 1 (same-file table): find table by `id` in current table set, roll it, add to result fields. **[Agent: general-purpose]**
  - [x] Implement trigger mode 2 (cross-file specific table): accept a `fetchTableSet` function parameter, lazy-fetch the referenced table set via TanStack Query, find table by `id`, roll it. **[Agent: general-purpose]**
  - [x] Implement trigger mode 3 (cross-file entire set): lazy-fetch the referenced table set, roll all non-conditional tables in it. **[Agent: general-purpose]**
  - [x] Add circular reference protection: maintain a `visited` set of `tableSet` paths during resolution. Skip already-visited sets and log a console warning. **[Agent: general-purpose]**
  - [x] Update `TableSetEntry` to pass TanStack Query's fetch function to `rollTableSet` for lazy trigger resolution. **[Agent: general-purpose]**
  - [x] Add sample data that exercises conditional tables: update `npc-generator.json` with a `conditional: true` mutations table triggered by a race entry. **[Agent: general-purpose]**
  - [x] Write unit tests: conditional tables skipped when not triggered. Same-file trigger works. Cross-file triggers resolve correctly (mock fetch). Circular references are caught. **[Agent: general-purpose]**
  - [x] Verify: Run `npm run dev` — roll an NPC, if race triggers mutations, see mutation field appear. If race doesn't trigger, no mutation field. **[Agent: general-purpose]**

---

- [x] **Slice 10: Dashboard recent rolls**
  - [x] Wire `recentRolls` from Zustand store to dashboard's recent rolls section. Display last 5 results, newest first. **[Agent: general-purpose]**
  - [x] Each recent roll renders as a compact `ResultCard` showing table set name and labeled fields. **[Agent: general-purpose]**
  - [x] Per-field re-rolls on category page update the corresponding entry in `recentRolls` in place (no new entry created). **[Agent: general-purpose]**
  - [x] Hide recent rolls section entirely when no rolls have been made. **[Agent: general-purpose]**
  - [x] Write component tests: full roll appears in recent rolls. Per-field re-roll updates existing entry. Max 5 entries enforced. Empty state hidden. **[Agent: general-purpose]**
  - [x] Verify: Run `npm run dev` — roll on category page, navigate home, see result in recent rolls. Roll 6 times, only 5 most recent shown. **[Agent: general-purpose]**

---

- [x] **Slice 11: Full sample data + validation error display**
  - [x] Create complete sample content: 2-3 table sets for NPCs (e.g., "NPC Generator" with race/name/trait/motivation + conditional mutations, "NPC Appearance" with build/clothing/feature). **[Agent: general-purpose]**
  - [x] Create complete sample content: 2-3 table sets for Weapons/Items (e.g., "Weapon Generator" with type/material/condition, "Trade Goods" with item/value/origin). **[Agent: general-purpose]**
  - [x] Ensure sample data exercises: different die sizes (d6, d10, d20), multi-result ranges, entries with/without descriptions, conditional tables with triggers, at least one cross-category trigger. **[Agent: general-purpose]**
  - [x] Wire `ErrorMessage` component into `TableSetEntry`: if a table set fails Zod validation or fetch, show inline error instead of the table set content. Other table sets still function. **[Agent: general-purpose]**
  - [x] Wire `ErrorMessage` into trigger resolution: if a cross-file trigger fails to resolve, show error for that field but don't break the rest of the result. **[Agent: general-purpose]**
  - [x] Verify: Run `npm run dev` — browse both categories, roll all table sets, confirm varied results. Intentionally break a JSON file, confirm error message appears inline without crashing the app. **[Agent: general-purpose]**

---

- [x] **Slice 12: Styling + polish**
  - [x] Define CSS custom properties in `global.css`: color palette, spacing scale, typography scale, border radius. **[Agent: general-purpose]**
  - [x] Create CSS Modules for each component: `CategoryCard.module.css`, `TableSetEntry.module.css`, `ResultCard.module.css`, `RerollButton.module.css`, `FilterInput.module.css`, `ErrorMessage.module.css`. **[Agent: general-purpose]**
  - [x] Style dashboard layout: categories grid/list, recent rolls section. **[Agent: general-purpose]**
  - [x] Style category page layout: heading, filter input, table set list with inline results. **[Agent: general-purpose]**
  - [x] Style result cards: labeled fields, re-roll button placement, stacked results spacing. **[Agent: general-purpose]**
  - [x] Style error messages: distinct but non-alarming inline error display. **[Agent: general-purpose]**
  - [x] Ensure clean, functional desktop-first UI. Usable (not optimized) on other screen sizes. **[Agent: general-purpose]**
  - [x] Verify: Run `npm run dev` — visually review all pages and interactions. Clean layout, readable typography, consistent spacing. **[Agent: general-purpose]**
