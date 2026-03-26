# Functional Specification: Category-Based Table Browsing

- **Roadmap Item:** Category-Based Table Browsing — Display a list of content categories as the entry point to the app; within each category, show available table sets the user can roll on.
- **Status:** Completed
- **Author:** Poe

---

## 1. Overview and Rationale (The "Why")

Vault Keeper's core value is speed — a GM needs to generate content without breaking the flow of a game session. Before any rolling can happen, the user needs to **find the right table set quickly**. Today, this means flipping through multiple Vaults of Vaarn zine issues, finding the right page, and locating the correct table. This specification defines the navigation structure that replaces that friction: a clean, organized browsing experience that gets the user from "I need an NPC" to the roll button in seconds.

**Success looks like:** The user can open Vault Keeper, identify the category they need, navigate to it, and locate a table set — all within a few seconds and with minimal clicks.

---

## 2. Functional Requirements (The "What")

### 2.1. Dashboard (Home Page)

- The dashboard is the first screen the user sees when opening Vault Keeper.
- It displays two sections:
  1. **Categories list** — all available content categories, showing only categories that have at least one table set.
  2. **Recent rolls** — the last 5 generated results from the current browser session.
- Each category entry shows only the **category name** (e.g., "NPCs", "Weapons/Items").
- Clicking a category navigates the user to that category's page.
- The recent rolls section is empty on first visit with no placeholder message needed — it simply doesn't render until there are results.

**Acceptance Criteria:**

- [x] When the user opens the app, they see a dashboard with a list of categories and a recent rolls section.
- [x] Only categories with at least one table set are displayed.
- [x] Each category shows its name only.
- [x] Clicking a category navigates to that category's page.
- [x] The recent rolls section shows up to 5 results from the current session, most recent first.
- [x] Recent rolls clear when the browser tab is closed.
- [x] If no rolls have been made yet, the recent rolls section is not displayed.

### 2.2. Category Page

- Each category has its own page showing all table sets within that category.
- Each table set entry shows only the **table set name** and a **Roll button**.
- A simple **text filter** is available at the top of the list, allowing the user to filter table sets by name as they type.
- Clicking the Roll button triggers the table set's random generation (defined in a separate spec).
- A back/home navigation element is present to return to the dashboard.

**Acceptance Criteria:**

- [x] When the user navigates to a category page, they see a list of all table sets in that category.
- [x] Each table set entry displays its name and a Roll button.
- [x] A text filter input is present at the top of the table set list.
- [x] Typing into the filter narrows the visible table sets to those whose name contains the typed text (case-insensitive).
- [x] Clearing the filter restores the full list.
- [x] The user can navigate back to the dashboard from the category page.

### 2.3. Category Discovery (Data-Driven)

- Categories are not hardcoded in the UI — they are derived from the available JSON data files at runtime.
- If a category's data contains zero table sets, that category does not appear anywhere in the app.
- The initial sample data ships with two categories: **NPCs** and **Weapons/Items**.

**Acceptance Criteria:**

- [x] Categories displayed in the app are derived from the JSON data files, not hardcoded.
- [x] Adding a new JSON data file with a new category causes that category to appear in the app without code changes.
- [x] Categories with no table sets are hidden from the UI entirely.

---

## 3. Scope and Boundaries

### In-Scope

- Dashboard page with categories list and recent rolls (last 5, current session).
- Category pages listing table sets with name and Roll button.
- Text filter on category pages to search table sets by name.
- Data-driven category discovery from JSON files.
- Navigation between dashboard and category pages.
- Two sample categories with placeholder data (NPCs, Weapons/Items).

### Out-of-Scope

- **One-Click Rolling / Random Generation Engine** — covered in a separate spec.
- **JSON-Driven Table Data format/schema** — covered in a separate spec.
- **Session Log** — Phase 2 roadmap item.
- **Save Individual Results** — Phase 2 roadmap item.
- **Responsive/mobile layout** — Phase 3 roadmap item.
- **Favorites/Pinned Tables** — Phase 3 roadmap item.
- Category reordering, custom icons, or descriptions.
- Drag-and-drop or any table set management UI.
