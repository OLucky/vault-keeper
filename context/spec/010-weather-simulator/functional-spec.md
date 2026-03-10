# Functional Specification: Vaarn Weather Simulator

- **Roadmap Item:** Quality of Life — Vaarn Weather Simulator
- **Status:** Completed
- **Author:** Claude

---

## 1. Overview and Rationale (The "Why")

Vaults of Vaarn uses a hex-based weather simulation system where a marker moves across a weather chart each day, driven by a d6 roll. The hex the marker lands on determines the day's weather, which has significant mechanical consequences — affecting travel speed, visibility, resource consumption, and even damage.

Currently, a GM must track this manually using the book's printed hex chart, a physical token, and dice. This is easy to lose track of between sessions, and cross-referencing the weather effect rules mid-game slows things down.

The Weather Simulator digitizes this system into Vault Keeper. The GM sees the hex grid, taps "Next Day," and instantly gets the weather result with full rules text — no book flipping, no lost markers, no forgotten positions. The marker position persists in local storage, so the campaign's weather state survives between sessions.

**Success criteria:** The GM uses the weather simulator during play instead of the physical hex chart, and the marker position reliably persists across sessions.

---

## 2. Functional Requirements (The "What")

- **The app must provide a dedicated Weather page accessible from the dashboard.**
  - **Acceptance Criteria:**
    - [x] A "Weather" link/card is visible on the main dashboard.
    - [x] Tapping it navigates to a dedicated Weather Simulator page.
    - [x] The page has a back link to the dashboard, consistent with existing category pages.

- **The page must display a visual hex grid matching the book's weather chart.**
  - **Acceptance Criteria:**
    - [x] The hex grid renders all hexes from the book's weather chart, each showing its weather type (via color, icon, pattern, or label).
    - [x] The current marker position is clearly indicated on the grid (e.g., highlighted border, marker icon).
    - [x] The "Start" hex (center of the grid) is identifiable.
    - [x] Edge hexes marked "X" in the book are visually distinct (blocked boundaries).
    - [x] A legend maps each visual style to its weather type name.

- **The GM must be able to advance the weather by one day with a single action.**
  - **Acceptance Criteria:**
    - [x] A "Next Day" button (or equivalent) is prominently visible on the page.
    - [x] Pressing it rolls a d6, moves the marker in the corresponding hex direction (1-6 mapping the six hex neighbors), and displays the new weather.
    - [x] The d6 result and direction are shown so the GM can verify the move.
    - [x] The marker visually animates or updates to its new position on the hex grid.

- **The simulator must follow the book's movement rules exactly.**
  - **Acceptance Criteria:**
    - [x] **Wrap-around:** If the marker would move off a non-X edge, it wraps to the opposite side of the grid.
    - [x] **X-boundary blocking:** If the marker would move off an edge marked X, the marker stays in its current hex (no movement). The weather for that day is the current hex's weather.
    - [x] The d6-to-direction mapping matches the book's hex direction diagram (1 = upper-left, 2 = upper-right, 3 = right, 4 = lower-right, 5 = lower-left, 6 = left).

- **The current weather effect must be displayed with full rules text from the book.**
  - **Acceptance Criteria:**
    - [x] After each day advance, the current weather type name is displayed prominently (e.g., "Dust Storm").
    - [x] The full rules text for that weather type is shown below the name, including all mechanical effects (travel speed, visibility, resource costs, damage, etc.).
    - [x] All 8 weather types are covered: Still, Hazy, Dust Storm, Sand Storm, Heatwave, Worm-pollen, Rain, Prismatic Tempest.

- **The GM must be able to manually place the marker on any hex.**
  - **Acceptance Criteria:**
    - [x] Tapping/clicking a hex on the grid moves the marker directly to that hex.
    - [x] The weather effect updates to reflect the newly selected hex.
    - [x] The new position is persisted to local storage.

- **The marker position must persist across browser sessions.**
  - **Acceptance Criteria:**
    - [x] The marker position is saved to browser local storage after each move.
    - [x] When the user reopens the app or navigates back to the Weather page, the marker is restored to its last saved position.
    - [x] A "Reset" action is available that returns the marker to the Start (center) hex and clears the saved state.

- **The GM must be able to reset the weather tracker.**
  - **Acceptance Criteria:**
    - [x] A "Reset" button is available on the Weather page.
    - [x] Pressing it moves the marker back to the center Start hex.
    - [x] The persisted state is cleared/updated accordingly.

---

## 3. Scope and Boundaries

### In-Scope

- Dedicated Weather page with visual hex grid
- d6-driven day-by-day weather advancement
- Full hex movement rules (wrap-around, X-boundary blocking)
- Display of all 8 weather effects with full rules text
- Manual marker placement on any hex (for mid-session corrections or campaign resumption)
- Marker position persistence in local storage
- Reset to starting position

### Out-of-Scope

- Weather history log (past days) — could be added later
- Automatic ration/water tracking based on weather effects
- Integration with session log (weather results are not captured in the session log)
- Multi-day advance (rolling multiple days at once)
- All other roadmap items (Responsive Layout, Favorites, PC Ability Scores, GitHub Pages, etc.)
