# Product Roadmap: Vault Keeper

_This roadmap outlines the strategic direction for Vault Keeper. It focuses on the "what" and "why," not the technical "how."_

---

### Phase 1 — Roll & Generate

_The core experience: browse tables, roll, and see results instantly._

- [x] **Category-Based Table Browsing**
  - [x] **Category Navigation:** Display a list of content categories (NPCs, Weapons/Items) as the entry point to the app.
  - [x] **Table Set Listing:** Within each category, show available table sets the user can roll on.

- [x] **One-Click Rolling**
  - [x] **Random Generation Engine:** Roll across all tables in a set simultaneously and display a combined result (e.g., NPC name + trait + motivation).
  - [x] **Re-Roll Action:** Allow the user to instantly re-roll for a new result without navigating away.

- [x] **JSON-Driven Table Data**
  - [x] **Table Data Format:** Define a JSON schema for table sets that supports single and multi-table rolls.
  - [x] **Sample Content:** Ship with placeholder/example table data for NPCs and Weapons/Items categories.

---

### Phase 2 — Saved Results & Persistence

_Capture results during play and save the ones worth keeping._

- [x] **Session Log**
  - [x] **Auto-Capture Results:** Automatically add each generated result to a running session log visible in the UI.
  - [x] **Organized by Category & Table Set:** Display logged results grouped by category and table set for easy scanning.
  - [x] **Export as Text:** Enable exporting the session log as plain text for use in notes or other tools.

- [x] **Save Individual Results**
  - [x] **Save a Result:** Allow the user to mark/save specific generated results they want to keep.
  - [x] **Saved Results Collection:** Provide a dedicated view of all saved results, persisted to browser local storage.
  - [x] **Remove Saved Results:** Let the user delete individual saved results they no longer need.

---

### Phase 3 — Polish

_Quality of life improvements refined based on real usage._

- [ ] **Quality of Life**
  - [x] **Responsive Layout:** Improve the UI for tablet/phone use at the game table.
  - [x] **Favorites/Pinned Tables:** Let the user pin frequently-used table sets for quick access.
