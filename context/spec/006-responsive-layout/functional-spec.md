# Functional Specification: Responsive Layout

- **Roadmap Item:** Phase 3 — Responsive Layout
- **Status:** Completed
- **Author:** Claude (with GM input)

---

## 1. Overview and Rationale (The "Why")

Vault Keeper is built for use at the game table, where a GM generates NPCs, items, and other content on the fly during play. In practice, the device at the table is far more likely to be a tablet or phone than a laptop. The current UI is desktop-first — fixed widths, no media queries, and small touch targets — making it difficult to use on anything smaller than a laptop screen.

**Responsive Layout** adapts the existing UI to work well on tablets and phones without changing any functionality. The same features are available on all devices; they just reflow and resize to fit the screen.

**Success looks like:** The GM comfortably uses Vault Keeper on a tablet or phone at the game table — tapping to roll, reviewing the session log, and saving results — without pinching, scrolling horizontally, or struggling to hit small buttons.

---

## 2. Functional Requirements (The "What")

### 2.1 Breakpoint System

- The app adapts its layout at two breakpoints: **small** (phone, up to 640px) and **medium** (tablet, 641px–960px). Above 960px, the current desktop layout is preserved unchanged.
  - **Acceptance Criteria:**
    - [x]On screens ≤640px wide, the phone layout is applied.
    - [x]On screens 641px–960px wide, the tablet layout is applied.
    - [x]On screens >960px wide, the current desktop layout is unchanged.
    - [x]Resizing the browser window transitions smoothly between layouts without breaking the UI.

### 2.2 Header & Navigation

- On phone and tablet screens, the header collapses the navigation links (Saved, etc.) into a hamburger menu. The logo/app name and the Session Log sidebar toggle button remain visible at all times.
- Tapping the hamburger icon opens a dropdown or panel showing the navigation links. Tapping a link navigates and closes the menu.
  - **Acceptance Criteria:**
    - [x]On phone and tablet, only the logo and sidebar toggle are visible in the header. A hamburger menu icon replaces the inline nav links.
    - [x]Tapping the hamburger icon reveals the navigation links.
    - [x]Tapping a navigation link closes the menu and navigates to the selected page.
    - [x]Tapping outside the menu or tapping the hamburger icon again closes it.
    - [x]On desktop, the full inline navigation is shown (no hamburger menu).

### 2.3 Session Log Sidebar

- On phone and tablet screens, the Session Log sidebar opens as a **full-screen overlay** instead of pushing the main content. A close button is clearly visible. The sidebar toggle button in the header continues to open/close it.
- On desktop (>960px), the sidebar continues to push the main content as it does today.
  - **Acceptance Criteria:**
    - [x]On phone and tablet, opening the sidebar displays it as a full-screen overlay covering the main content.
    - [x]The overlay includes a clearly visible close button (or the header toggle closes it).
    - [x]The main content is not visible behind the overlay (full-screen, not a drawer).
    - [x]On desktop, the sidebar behaves as it does today (push layout, 320px fixed width).
    - [x]The unseen-count badge on the sidebar toggle button works the same across all screen sizes.

### 2.4 Main Content Area

- On phone screens, the main content area uses the full screen width with reduced padding. The 960px max-width constraint is removed.
- On tablet screens, the main content area uses the full screen width with moderately reduced padding.
  - **Acceptance Criteria:**
    - [x]On phone, main content padding is reduced (e.g., from 2rem to 1rem) and content spans the full width.
    - [x]On tablet, main content padding is moderately reduced and content spans the full width.
    - [x]On desktop, the current 960px max-width and 2rem padding are preserved.

### 2.5 Dashboard Category Grid

- On phone screens, category cards stack in a single column (one card per row, full width).
- On tablet and desktop screens, the auto-fill grid continues to work as-is (it already adapts naturally).
  - **Acceptance Criteria:**
    - [x]On phone, category cards display in a single column, each taking the full width.
    - [x]On tablet, the grid displays 2+ columns as space allows.
    - [x]On desktop, the grid behaves as it does today.

### 2.6 Touch Targets

- All interactive elements (buttons, links, toggles, bookmark icons, delete buttons) meet a minimum touch target size of 44×44px on phone and tablet screens. This applies to tap area, not necessarily visual size — padding or hit areas can be expanded.
  - **Acceptance Criteria:**
    - [x]All buttons and interactive elements have a minimum tappable area of 44×44px on phone and tablet.
    - [x]Visual button sizes may remain compact where appropriate, but the tap area is expanded (e.g., via padding or transparent hit area).
    - [x]The delete (×) buttons on session log entries and saved results are easy to tap without accidentally tapping adjacent elements.

### 2.7 Typography Scaling

- Heading sizes scale down on smaller screens to prevent text overflow and maintain visual hierarchy without dominating the limited space.
  - **Acceptance Criteria:**
    - [x]On phone, large headings (H1, H2) are visually smaller than their desktop equivalents while maintaining hierarchy.
    - [x]Body text remains legible at its current size (no reduction needed).
    - [x]No horizontal text overflow or text truncation on phone screens.

### 2.8 Saved Results Page

- The Saved Results page adapts to smaller screens: the header actions (Copy, Download) reflow as needed, and saved result cards use full width.
  - **Acceptance Criteria:**
    - [x]On phone, the page header and action buttons stack or wrap naturally without overflow.
    - [x]Saved result cards span the full width on phone screens.
    - [x]The inline note editor remains usable on phone (full-width text field).

---

## 3. Scope and Boundaries

### In-Scope

- CSS-only responsive adaptations using media queries and flexible layout adjustments.
- Hamburger menu for navigation on phone and tablet.
- Full-screen overlay for Session Log sidebar on phone and tablet.
- Touch target size improvements for phone and tablet.
- Typography scaling for smaller screens.
- Reduced padding/margins for smaller screens.

### Out-of-Scope

- **Favorites/Pinned Tables** — separate Phase 3 roadmap item.
- **Native mobile app** — this is a web app responsive adaptation, not a native app.
- **Orientation-specific layouts** — no separate landscape vs. portrait designs. The responsive breakpoints handle both.
- **Offline/PWA support** — not part of this specification.
- **New features or functionality** — this spec only adapts the existing UI. No new buttons, pages, or workflows.
- **Dark mode or theme changes** — visual styling stays the same; only layout and sizing adapt.
