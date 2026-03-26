# Functional Specification: One-Click Rolling

- **Roadmap Item:** One-Click Rolling — Roll across all tables in a set simultaneously and display a combined result; allow instant re-rolling.
- **Status:** Completed
- **Author:** Poe

---

## 1. Overview and Rationale (The "Why")

Rolling on random tables is the single most important action in Vault Keeper. During a live session, a GM needs a new NPC, weapon, or other element _right now_ — not after flipping pages, finding a table, rolling physical dice, and cross-referencing results. This spec defines how the user triggers a roll, sees the result, re-rolls individual fields, and manages multiple generated results — all without leaving the category page.

**Success looks like:** The user clicks Roll and sees a complete, multi-field result in under 2 seconds. They can tweak individual fields with per-field re-rolls and generate multiple options by rolling again, all inline.

---

## 2. Functional Requirements (The "What")

### 2.1. Rolling a Table Set

- Each table set on a category page has a **Roll button** (as defined in spec 001).
- Clicking Roll generates a result by randomly selecting one entry from each table in the set simultaneously.
- The result appears **inline on the category page**, directly below the table set entry.
- Each field in the result is displayed as a **labeled field**: the table name as the label, followed by the randomly selected entry's content.
- If a table entry has both a **title** and a **description**, both are displayed (e.g., "Trait: Paranoid — Trusts no one, always checks exits").
- If a table entry has only a title (no description), just the title is shown.
- The roll is instant — no loading state or animation is required, though a subtle transition is acceptable.

**Acceptance Criteria:**

- [x] Clicking the Roll button on a table set generates a result from all tables in the set.
- [x] The result appears inline below the table set entry on the category page.
- [x] Each field shows a label (table name) and the selected entry's title.
- [x] If the selected entry has a description, it is displayed alongside the title.
- [x] If the selected entry has no description, only the title is shown.
- [x] The result appears in under 2 seconds.

### 2.2. Per-Field Re-Roll

- Each field within a generated result has its own **re-roll button** (e.g., a small icon next to the field).
- Clicking a field's re-roll button randomly selects a new entry from that specific table only, replacing just that field.
- All other fields in the result remain unchanged.

**Acceptance Criteria:**

- [x] Each field in a result has a re-roll button.
- [x] Clicking a field's re-roll button replaces only that field with a new random entry from the same table.
- [x] Other fields in the result are not affected by a per-field re-roll.

### 2.3. Stacked Results

- Clicking the Roll button again on the same table set generates a **new result** that is added to a stack of results displayed inline below that table set.
- Results are displayed in reverse chronological order (newest on top).
- A maximum of **10 results** are shown per table set. When a new result would exceed 10, the oldest result is removed.
- Stacked results persist as long as the user remains on the category page. **Navigating away from the category page clears all stacked results.**

**Acceptance Criteria:**

- [x] Rolling again on the same table set adds a new result above the previous one.
- [x] Results are displayed newest first.
- [x] A maximum of 10 results are visible per table set. The oldest is removed when a new one exceeds the limit.
- [x] Navigating away from the category page clears all stacked results for all table sets.

### 2.4. Recent Rolls (Dashboard Integration)

- Each generated result (from a full roll, not from a per-field re-roll) is added to the dashboard's **recent rolls** section (as defined in spec 001).
- Per-field re-rolls do NOT create new entries in recent rolls — they update the existing result in place.

**Acceptance Criteria:**

- [x] Each full roll adds an entry to the dashboard's recent rolls list.
- [x] Per-field re-rolls do not add new entries to the recent rolls list.
- [x] The recent rolls list shows the most current state of each result (reflecting any per-field re-rolls).

---

## 3. Scope and Boundaries

### In-Scope

- Rolling a table set and displaying inline results with labeled fields.
- Table entries with optional title and description.
- Per-field re-roll to replace individual fields.
- Stacked results (up to 10) with newest-first ordering.
- Clearing stacked results on navigation away from the category page.
- Feeding results to the dashboard's recent rolls section.

### Out-of-Scope

- **Category-Based Table Browsing** — covered in spec 001.
- **JSON-Driven Table Data format/schema** — covered in a separate spec (defines the structure that the rolling engine reads from).
- **Session Log** — Phase 2 roadmap item.
- **Save Individual Results** — Phase 2 roadmap item.
- **Responsive/mobile layout** — Phase 3 roadmap item.
- **Favorites/Pinned Tables** — Phase 3 roadmap item.
- Animations or dice-rolling visual effects.
- Undo/redo for re-rolls.
- Roll history beyond the 10-item inline stack.
