# Functional Specification: Favorites/Pinned Tables

- **Roadmap Item:** Phase 3 — Favorites/Pinned Tables
- **Status:** Approved
- **Author:** Claude (with GM input)

---

## 1. Overview and Rationale (The "Why")

As more table sets are added to Vault Keeper (the long-term goal is full sourcebook coverage), the navigation path from dashboard → category → table set grows longer. During a session, the GM tends to use the same handful of table sets repeatedly — the NPC generator, the loot table, a weather table. Navigating through categories each time adds unnecessary friction, especially on a phone or tablet at the game table.

**Favorites/Pinned Tables** lets the GM pin frequently-used table sets to the dashboard for one-tap access. Instead of drilling into a category every time, the GM's go-to tables are right there on the home page.

**Success looks like:** The GM pins 3–5 table sets before a session and accesses them directly from the dashboard throughout play, rarely needing to browse categories for their most-used generators.

---

## 2. Functional Requirements (The "What")

### 2.1 Pin a Table Set

- On the category page, each table set displays a pin/star icon. Clicking it adds the table set to the user's pinned collection.
- Table sets that are already pinned display a filled/active icon, indicating their pinned state.
- Clicking the active icon unpins the table set (removes it from the collection).
  - **Acceptance Criteria:**
    - [ ] Each table set on the category page has a pin action (e.g., star or pin icon).
    - [ ] Clicking the icon pins the table set and the icon changes to a filled/active state.
    - [ ] Clicking the active icon unpins the table set and the icon returns to its default state.
    - [ ] Pinning and unpinning do not require a confirmation prompt (instant toggle).

### 2.2 Pinned Section on Dashboard

- When the user has pinned at least one table set, a "Pinned" section appears at the top of the dashboard, above the category grid.
- Each pinned table set is displayed as a clickable card that navigates to the table set's roll view.
- The cards show the table set name and its source category for context.
  - **Acceptance Criteria:**
    - [ ] A "Pinned" section appears at the top of the dashboard when at least one table set is pinned.
    - [ ] Each pinned card displays the table set name and its source category.
    - [ ] Clicking a pinned card navigates to that table set's roll view.
    - [ ] When no table sets are pinned, the pinned section is not shown on the dashboard.

### 2.3 Manual Reordering

- The user can drag pinned cards to rearrange them in their preferred order.
- The custom order persists across page refreshes and browser sessions.
  - **Acceptance Criteria:**
    - [ ] Pinned cards can be reordered by dragging.
    - [ ] The new order is saved immediately and persists after page refresh.
    - [ ] Newly pinned table sets are added to the end of the list.

### 2.4 Unpin from Dashboard

- In addition to unpinning from the category page, the user can unpin a table set directly from the pinned section on the dashboard (e.g., via a small unpin icon on the card).
  - **Acceptance Criteria:**
    - [ ] Each pinned card on the dashboard has an unpin action (e.g., a small × or unpin icon).
    - [ ] Clicking the unpin action removes the card from the pinned section immediately.
    - [ ] The corresponding pin icon on the category page reverts to its default/unpinned state.

### 2.5 Persistence

- Pinned table sets and their order are persisted to browser local storage.
- Pinned tables persist independently of the session log and saved results.
  - **Acceptance Criteria:**
    - [ ] Pinned table sets persist across page refreshes and browser tab closures.
    - [ ] The custom order is preserved after refresh.
    - [ ] Clearing the session log or saved results does not affect pinned tables.

---

## 3. Scope and Boundaries

### In-Scope

- Pin/unpin action on category page table set listings.
- Pinned section on the dashboard with clickable cards linking to roll views.
- Manual drag-to-reorder of pinned cards.
- Unpin action on dashboard cards.
- Persistence via browser local storage.

### Out-of-Scope

- **Responsive Layout** — separate Phase 3 roadmap item.
- **Rolling directly from the dashboard** — pinned cards link to the roll view; they do not embed a roll action on the dashboard itself.
- **Pinning categories** — only individual table sets can be pinned, not entire categories.
- **Folders or custom groups** — pinned tables are a flat, ordered list with no grouping.
- **Pin limit** — no maximum number of pinned table sets.
- **Pin action on the roll view** — pinning is done from the category page only.
