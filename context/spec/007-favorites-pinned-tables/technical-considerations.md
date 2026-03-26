# Technical Specification: Favorites/Pinned Tables

- **Functional Specification:** context/spec/007-favorites-pinned-tables/functional-spec.md
- **Status:** Completed
- **Author(s):** Claude (with GM input)

---

## 1. High-Level Technical Approach

Favorites/Pinned Tables adds a **new Zustand store** for pinned table set references, a **pin toggle** on the category page's TableSetEntry component, a **PinnedTableCard** component, and a **Pinned section** on the dashboard with drag-to-reorder via React Aria's `useDragAndDrop`.

No changes to existing data models, APIs, or routing. The feature is entirely additive.

**Files affected:**

- **New:** `src/stores/favoritesStore.ts` — Zustand store with persist middleware
- **New:** `src/components/PinnedTableCard/PinnedTableCard.tsx` + `.module.css`
- `src/components/TableSetEntry/TableSetEntry.tsx` + `.module.css` — add pin toggle button
- `src/routes/index.tsx` — add Pinned section to dashboard
- `src/routes/Dashboard.module.css` — styles for pinned section

---

## 2. Proposed Solution & Implementation Plan

### 2.1 Favorites Store

**New file:** `src/stores/favoritesStore.ts`

Follows the existing Zustand persist pattern (same as `sessionLogStore` and `savedResultsStore`).

**State shape:**

| Field             | Type               | Description                   |
| ----------------- | ------------------ | ----------------------------- |
| `pinnedTableSets` | `PinnedTableSet[]` | Ordered array of pinned items |

**PinnedTableSet type:**

| Field          | Type     | Description                                       |
| -------------- | -------- | ------------------------------------------------- |
| `categoryId`   | `string` | Category folder name (e.g., "npcs")               |
| `fileName`     | `string` | Table set file name (e.g., "npc-generator.json")  |
| `tableSetName` | `string` | Display name (cached from TableSet data)          |
| `categoryName` | `string` | Category display name (cached from CategoryIndex) |

**Actions:**

| Action         | Signature                                           | Description                                         |
| -------------- | --------------------------------------------------- | --------------------------------------------------- |
| `addPinned`    | `(item: PinnedTableSet) => void`                    | Appends to end of array (guards against duplicates) |
| `removePinned` | `(categoryId: string, fileName: string) => void`    | Removes by composite key                            |
| `reorder`      | `(items: PinnedTableSet[]) => void`                 | Replaces array with new order                       |
| `isPinned`     | `(categoryId: string, fileName: string) => boolean` | Checks if a table set is pinned                     |

**Persistence config:**

- LocalStorage key: `"vault-keeper-favorites"`
- Partialize: only persist `pinnedTableSets`

**Unique key:** Items are identified by the composite `categoryId + fileName`. The `addPinned` action should guard against duplicates.

### 2.2 Pin Toggle on Category Page

**Modified component:** `src/components/TableSetEntry/TableSetEntry.tsx` + `.module.css`

Add a pin button (star icon) to each table set entry, between the name and the Roll button:

```
.entry → [name] [pin-button] [roll-button]
```

- Uses React Aria `Button` with `onPress` handler
- Icon: `☆` (U+2606, unpinned) / `★` (U+2605, pinned)
- Pinned state color: `--color-accent-violet`
- Unpinned state color: `--color-text-muted` (matches existing icon button patterns)
- Calls `addPinned()` or `removePinned()` from `favoritesStore`
- No confirmation prompt (instant toggle per spec)

The component needs access to `categoryId`, `fileName`, and `categoryName` to construct the `PinnedTableSet` object. `categoryId` and `fileName` are already props. `categoryName` needs to be passed down from the route component or derived from the category query.

### 2.3 PinnedTableCard Component

**New component:** `src/components/PinnedTableCard/PinnedTableCard.tsx` + `.module.css`

Similar to `CategoryCard` but with additional content:

- **Primary content:** `tableSetName` (font-size lg, weight 600)
- **Subtitle:** `categoryName` (font-size sm, color text-secondary)
- **Unpin button:** Small `×` icon in top-right corner, calls `removePinned()`
- **Navigation:** `<Link to="/$categoryId" params={{ categoryId }}>` — navigates to category page
- **Drag handle:** The entire card is draggable via React Aria DnD

**Props:**

| Prop           | Type     | Description                     |
| -------------- | -------- | ------------------------------- |
| `categoryId`   | `string` | For navigation link             |
| `fileName`     | `string` | For removePinned identification |
| `tableSetName` | `string` | Display name                    |
| `categoryName` | `string` | Subtitle text                   |

**Styling:** Follow `CategoryCard` pattern — same padding, background, border, hover/focus states. Unpin button positioned absolutely in top-right (similar to bookmark button on ResultCard).

### 2.4 Pinned Section on Dashboard

**Modified component:** `src/routes/index.tsx` + `Dashboard.module.css`

Conditionally render a "Pinned" section above the Categories section:

- Only shown when `pinnedTableSets.length > 0`
- Heading: `<h2>Pinned</h2>` (matches "Categories" heading style)
- Grid layout: same `repeat(auto-fill, minmax(240px, 1fr))` as categories grid
- Contains `PinnedTableCard` components wrapped in React Aria's `useDragAndDrop` for reordering

**CSS:** Add `.pinnedGrid` class (can reuse `.categoriesGrid` pattern) and `.pinnedSection` for the section wrapper.

### 2.5 Drag-to-Reorder

Use React Aria's `useDragAndDrop` hook with `GridList` for accessible drag-and-drop reordering:

- Wrap the pinned cards in a `GridList` with `dragAndDropHooks` from `useDragAndDrop`
- Configure for reorder-only (no external drop targets)
- On reorder, call `favoritesStore.reorder()` with the new array order
- Keyboard support: React Aria provides arrow key + Enter/Space reordering automatically
- Touch support: React Aria handles long-press to initiate drag on touch devices

The `useDragAndDrop` hook is configured with:

- `acceptedDragTypes: ['pinned-table']`
- `getItems`: returns drag data for each pinned card
- `onReorder`: handler that reorders the array and calls `store.reorder()`

---

## 3. Impact and Risk Analysis

**System Dependencies:**

- Zustand store: new store, no changes to existing stores.
- React Aria: `useDragAndDrop` from `react-aria-components` (already installed v1.16.0). First DnD usage in the codebase.
- TanStack Router: uses existing `<Link to="/$categoryId">` pattern.

**Potential Risks & Mitigations:**

| Risk                                | Impact                                          | Mitigation                                                                |
| ----------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------- |
| Stale cached names in store         | Pinned card shows old name if JSON data changes | Low risk — table data is static. Could add sync later if needed           |
| React Aria DnD learning curve       | First DnD in codebase, may need iteration       | Keep implementation minimal — reorder only, no cross-container DnD        |
| Touch DnD on mobile                 | Must work on phone/tablet                       | React Aria handles touch events natively (long-press to drag)             |
| Pin button too close to Roll button | Accidental taps on mobile                       | Ensure 44×44px minimum touch targets (already enforced by responsive CSS) |

---

## 4. Testing Strategy

- **Pin/unpin toggle:** Navigate to category page, click pin icon, verify it toggles. Revisit page, verify state persists.
- **Dashboard pinned section:** Pin a table set, navigate to dashboard, verify "Pinned" section appears with card. Unpin all, verify section disappears.
- **Card navigation:** Click pinned card on dashboard, verify navigation to correct category page.
- **Drag-to-reorder:** Drag cards to reorder, refresh page, verify order persists.
- **Unpin from dashboard:** Click unpin (×) on dashboard card, verify removal. Navigate to category page, verify pin icon is unpinned.
- **Persistence:** Pin items, refresh page, verify pinned items and order are preserved. Clear session log, verify pinned items unaffected.
- **Responsive:** Verify pinned section grid adapts on phone (single column) and tablet.
