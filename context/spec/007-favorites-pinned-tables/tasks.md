# Tasks: Favorites/Pinned Tables (Spec 007)

- [x] **Slice 1: Favorites Store + Pin Toggle on Category Page**
  - [x] Create `src/stores/favoritesStore.ts` — Zustand store with `persist` middleware, `PinnedTableSet` type, `addPinned`, `removePinned`, `reorder`, `isPinned` actions. localStorage key `vault-keeper-favorites`. **[Agent: general-purpose]**
  - [x] Modify `src/components/TableSetEntry/TableSetEntry.tsx` + `.module.css` — add star icon button (☆/★) between name and Roll button. Wire to `addPinned`/`removePinned`. Pass `categoryName` down (derive from category query in route). Pin color: `--color-accent-violet`. **[Agent: general-purpose]**
  - [x] Verify: Navigate to a category page. Pin a table set — icon changes to ★ with violet color. Unpin — icon reverts to ☆. Refresh page — pinned state persists. **[Agent: general-purpose]**

- [x] **Slice 2: Pinned Section on Dashboard with Unpin**
  - [x] Create `src/components/PinnedTableCard/PinnedTableCard.tsx` + `.module.css` — card with table set name, category subtitle, unpin × button, and `<Link>` to `/$categoryId`. Style matching `CategoryCard` pattern. **[Agent: general-purpose]**
  - [x] Modify `src/routes/index.tsx` + `Dashboard.module.css` — add conditional "Pinned" section above Categories. Grid layout matching categories grid. Render `PinnedTableCard` for each pinned item. **[Agent: general-purpose]**
  - [x] Verify: Pin a table set, go to dashboard — "Pinned" section appears with card showing name + category. Click card — navigates to category page. Click × — card removed. Unpin all — section disappears. Navigate to category page — icon reflects unpinned state. Refresh — order and pins persist. **[Agent: general-purpose]**

- [x] **Slice 3: Drag-to-Reorder**
  - [x] Modify `src/routes/index.tsx` — wrap pinned section in React Aria `GridList` with `useDragAndDrop`. Configure for reorder-only. On reorder, call `favoritesStore.reorder()`. **[Agent: general-purpose]**
  - [x] Modify `src/components/PinnedTableCard/PinnedTableCard.tsx` — adapt to work as a `GridListItem` for React Aria DnD. Ensure keyboard and touch reordering work. **[Agent: general-purpose]**
  - [x] Verify: Pin 3+ table sets. Drag a card to a new position — order updates. Refresh — new order persists. Pin a new table set — it appears at the end. **[Agent: general-purpose]**
