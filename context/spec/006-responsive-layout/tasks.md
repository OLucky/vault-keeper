# Tasks: Responsive Layout (Spec 006)

- **Technical Specification:** context/spec/006-responsive-layout/technical-considerations.md
- **Functional Specification:** context/spec/006-responsive-layout/functional-spec.md

---

## Pre-requisites

- Playwright browser MCP is available for UI verification.

---

## Task List

- [x] **Slice 1: CSS Foundation — Breakpoints, Main Content, Dashboard Grid, Typography**

  The smallest visible responsive change. After this slice, resizing the browser below 960px shows adapted padding, full-width content, single-column dashboard cards on phone, and scaled-down headings.

  - [x] Add phone typography scaling to `src/styles/global.css`: media query at `max-width: 640px` overriding `:root` values for `--text-3xl` (→ 1.5rem) and `--text-2xl` (→ 1.25rem). **[Agent: general-purpose]**
  - [x] Add tablet and phone media queries to `src/routes/Root.module.css` for `.main`: remove `max-width`, set padding to `var(--space-lg)` at ≤960px and `var(--space-md)` at ≤640px. **[Agent: general-purpose]**
  - [x] Add phone media query to `src/routes/Dashboard.module.css` for `.categoriesGrid`: set `grid-template-columns: 1fr` at ≤640px. **[Agent: general-purpose]**
  - [x] **Verify:** Open the app in Playwright at 375px width. Confirm: main content has 16px padding, no max-width constraint, category cards stack in a single column, and H1/H2 headings are visually smaller. Resize to 768px and confirm 24px padding and multi-column grid. Resize to 1200px and confirm the desktop layout is unchanged (960px max-width, 32px padding). **[Agent: general-purpose]**

- [x] **Slice 2: Hamburger Menu**

  New `HamburgerMenu` component replaces inline nav links on phone and tablet. After this slice, navigation works on all screen sizes.

  - [x] Create `src/components/HamburgerMenu/HamburgerMenu.tsx` and `HamburgerMenu.module.css`. Use React Aria's `DialogTrigger` + `Popover` for accessible dropdown. Trigger: hamburger icon button. Content: `<Link to="/saved">Saved</Link>` (and any future nav links). Clicking a link closes the popover and navigates. **[Agent: general-purpose]**
  - [x] Update `src/routes/__root.tsx` to render `<HamburgerMenu />` in the header alongside inline nav links. **[Agent: general-purpose]**
  - [x] Add CSS to `src/routes/Root.module.css`: at ≤960px hide `.navLink` (`display: none`), show `.hamburger` (`display: block`). At >960px hide `.hamburger` (`display: none`), show `.navLink`. **[Agent: general-purpose]**
  - [x] **Verify:** Open the app in Playwright at 375px. Confirm: hamburger icon is visible, inline "Saved" link is hidden. Click hamburger → popover appears with "Saved" link. Click "Saved" → navigates to /saved, popover closes. Press Escape → popover closes. Resize to 1200px → inline nav links visible, hamburger hidden. **[Agent: general-purpose]**

- [x] **Slice 3: Session Log Sidebar Full-Screen Overlay**

  The sidebar becomes a full-screen overlay on phone and tablet, with a dedicated close button. After this slice, the sidebar is usable on all screen sizes.

  - [x] Add media query to `src/components/SessionLogSidebar/SessionLogSidebar.module.css`: at ≤960px, set `.sidebar` to `position: fixed; inset: 0; width: 100%; min-width: unset; z-index: 50`. **[Agent: general-purpose]**
  - [x] Update `src/components/SessionLogSidebar/SessionLogSidebar.tsx`: add a close button (✕) in the sidebar header actions that calls `toggleSidebar()` from the Zustand store. **[Agent: general-purpose]**
  - [x] Add CSS for the close button: hidden on desktop (`display: none` above 960px), visible on phone/tablet. Style consistently with existing `.actionButton`. **[Agent: general-purpose]**
  - [x] **Verify:** Open the app in Playwright at 375px. Click the sidebar toggle → sidebar appears as full-screen overlay covering main content. Close button (✕) is visible. Click close → sidebar closes. Open sidebar again, trigger "Clear" confirm dialog → dialog appears above sidebar (z-index 100 > 50). Badge count updates correctly. Resize to 1200px → sidebar pushes main content as before, close button is hidden. **[Agent: general-purpose]**

- [x] **Slice 4: Polish — Touch Targets + Saved Results Page**

  Final polish: expand touch targets for all interactive elements and adapt the Saved Results page layout.

  - [x] Add `@media (max-width: 960px)` to `src/components/RerollButton/RerollButton.module.css`: set `.rerollButton` to `min-width: 44px; min-height: 44px`. **[Agent: general-purpose]**
  - [x] Add `@media (max-width: 960px)` to `src/components/ResultCard/ResultCard.module.css`: set `.bookmark` to `min-width: 44px; min-height: 44px`. **[Agent: general-purpose]**
  - [x] Add `@media (max-width: 960px)` to `src/components/SessionLogSidebar/SessionLogEntry.module.css`: set `.bookmarkButton` and `.deleteButton` to `min-width: 44px; min-height: 44px`. **[Agent: general-purpose]**
  - [x] Add `@media (max-width: 960px)` to `src/components/SavedResultCard/SavedResultCard.module.css`: set `.deleteButton` to `min-width: 44px; min-height: 44px`. **[Agent: general-purpose]**
  - [x] Add `@media (max-width: 960px)` to `src/components/SidebarToggle/SidebarToggle.module.css`: set `.toggle` to `min-width: 44px; min-height: 44px`. **[Agent: general-purpose]**
  - [x] Add `@media (max-width: 640px)` to `src/routes/Saved.module.css`: set `.header` to `flex-wrap: wrap`. **[Agent: general-purpose]**
  - [x] **Verify:** Open the app in Playwright at 375px. Navigate to a category page, roll a result. Inspect computed sizes of reroll button (≥44×44), bookmark icon (≥44×44). Open sidebar, inspect bookmark and delete buttons on log entries (≥44×44). Navigate to /saved, confirm header/actions wrap and result cards span full width. Inspect delete button on saved cards (≥44×44). Resize to 1200px and confirm no visual changes to desktop layout. **[Agent: general-purpose]**

---

## Recommendations

| Task/Slice | Issue | Recommendation |
|---|---|---|
| All implementation sub-tasks | Assigned to `general-purpose` — no CSS/React specialist available | Consider installing a `react-expert` subagent for better delegation of React + CSS Module tasks |
