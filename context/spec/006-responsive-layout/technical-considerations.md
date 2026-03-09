# Technical Specification: Responsive Layout

- **Functional Specification:** context/spec/006-responsive-layout/functional-spec.md
- **Status:** Completed
- **Author(s):** Claude (with GM input)

---

## 1. High-Level Technical Approach

Responsive Layout is primarily a **CSS-only adaptation** of the existing UI. Two media query breakpoints (≤640px for phone, ≤960px for tablet) are added to existing CSS Module files. The only JavaScript change is a new **HamburgerMenu** component (using React Aria's Popover) and a **close button** added to the sidebar header for mobile/tablet.

No state management, routing, data model, or business logic changes are required.

**Files affected:**
- `src/styles/global.css` — typography scaling via :root overrides
- `src/routes/Root.module.css` — header, main content, sidebar layout
- `src/routes/__root.tsx` — render HamburgerMenu + sidebar close button
- `src/routes/Dashboard.module.css` — category grid single-column on phone
- `src/routes/Saved.module.css` — header/actions wrap on phone
- `src/components/SessionLogSidebar/SessionLogSidebar.module.css` — full-screen overlay
- `src/components/SessionLogSidebar/SessionLogSidebar.tsx` — close button
- `src/components/RerollButton/RerollButton.module.css` — touch target
- `src/components/ResultCard/ResultCard.module.css` — bookmark touch target
- `src/components/SessionLogSidebar/SessionLogEntry.module.css` — touch targets
- `src/components/SavedResultCard/SavedResultCard.module.css` — delete touch target
- `src/components/SidebarToggle/SidebarToggle.module.css` — touch target
- **New:** `src/components/HamburgerMenu/HamburgerMenu.tsx` + `.module.css`

---

## 2. Proposed Solution & Implementation Plan

### 2.1 Breakpoint System

Two breakpoints, implemented as `@media` queries in individual CSS Module files:

| Label   | Query                           | Applies to      |
|---------|---------------------------------|-----------------|
| Phone   | `@media (max-width: 640px)`     | ≤640px screens  |
| Tablet  | `@media (max-width: 960px)`     | 641px–960px *   |
| Desktop | No query (default styles)       | >960px          |

\* Tablet query uses `max-width: 960px` and phone-specific overrides use `max-width: 640px`. Since phone rules are more specific (narrower), they are placed after tablet rules to naturally override them via source order.

### 2.2 Header & Navigation (HamburgerMenu)

**New component:** `src/components/HamburgerMenu/HamburgerMenu.tsx` + `.module.css`

- Uses React Aria's `DialogTrigger` + `Popover` for accessible dropdown behavior (focus management, Escape-to-close, click-outside dismissal).
- Trigger button: a hamburger icon (☰ or SVG) button.
- Popover content: the navigation links (`<Link to="/saved">Saved</Link>`, etc.).
- Clicking a link calls `close()` on the popover and navigates.

**Root layout changes** (`__root.tsx` / `Root.module.css`):
- Render both inline nav links and `<HamburgerMenu />` in the header.
- CSS hides/shows them based on breakpoint:
  - `≤960px`: `.navLink { display: none }`, `.hamburger { display: block }`
  - `>960px`: `.navLink { display: inline }`, `.hamburger { display: none }`

### 2.3 Session Log Sidebar — Full-Screen Overlay

**CSS changes** (`SessionLogSidebar.module.css`):
```css
@media (max-width: 960px) {
  .sidebar {
    position: fixed;
    inset: 0;
    width: 100%;
    min-width: unset;
    z-index: 50;
  }
}
```

**Component change** (`SessionLogSidebar.tsx`):
- Add a close button (✕) in `.headerActions` that calls `toggleSidebar()` from the Zustand store.
- The close button is hidden on desktop via CSS (`display: none` above 960px).

### 2.4 Main Content Area

**CSS changes** (`Root.module.css`):
```css
@media (max-width: 960px) {
  .main {
    max-width: none;
    padding: var(--space-lg); /* 24px for tablet */
  }
}
@media (max-width: 640px) {
  .main {
    padding: var(--space-md); /* 16px for phone */
  }
}
```

### 2.5 Dashboard Category Grid

**CSS changes** (`Dashboard.module.css`):
```css
@media (max-width: 640px) {
  .categoriesGrid {
    grid-template-columns: 1fr;
  }
}
```
Tablet: the existing `auto-fill, minmax(240px, 1fr)` adapts naturally — no change needed.

### 2.6 Touch Targets (≤960px)

All interactive elements get a minimum 44×44px tap area on phone and tablet. Changes are made via `@media (max-width: 960px)` in each component's CSS Module:

| Component           | File                              | Current Size | Change                              |
|---------------------|-----------------------------------|-------------|-------------------------------------|
| RerollButton        | RerollButton.module.css           | 24×24px     | `min-width: 44px; min-height: 44px` |
| Bookmark (ResultCard)| ResultCard.module.css            | No minimum  | `min-width: 44px; min-height: 44px` |
| Bookmark (LogEntry) | SessionLogEntry.module.css        | No minimum  | `min-width: 44px; min-height: 44px` |
| Delete (LogEntry)   | SessionLogEntry.module.css        | No minimum  | `min-width: 44px; min-height: 44px` |
| Delete (SavedCard)  | SavedResultCard.module.css        | No minimum  | `min-width: 44px; min-height: 44px` |
| SidebarToggle       | SidebarToggle.module.css          | ~30px       | `min-width: 44px; min-height: 44px` |

### 2.7 Typography Scaling

**CSS changes** (`global.css`) — override `:root` custom properties:
```css
@media (max-width: 640px) {
  :root {
    --text-3xl: 1.5rem;  /* 32px → 24px */
    --text-2xl: 1.25rem; /* 24px → 20px */
  }
}
```
All components using these variables automatically scale. Body text (`--text-base`) is unchanged.

### 2.8 Saved Results Page

**CSS changes** (`Saved.module.css`):
```css
@media (max-width: 640px) {
  .header {
    flex-wrap: wrap;
  }
}
```
Cards already use flex layout and fill available width.

---

## 3. Impact and Risk Analysis

**System Dependencies:**
- Zustand store: sidebar toggle state is reused; no store changes needed.
- React Aria: `react-aria-components` is already installed (v1.16.0). HamburgerMenu adds `DialogTrigger` + `Popover`.
- TanStack Router: nav `<Link>` components are reused in the hamburger menu.

**Potential Risks & Mitigations:**

| Risk | Impact | Mitigation |
|------|--------|------------|
| Sidebar z-index conflicts with ConfirmDialog | Dialog could appear behind overlay | Sidebar uses `z-index: 50`; ConfirmDialog already uses `z-index: 100` |
| CSS source order matters for breakpoint overrides | Phone styles might not override tablet | Place phone queries (`≤640px`) after tablet queries (`≤960px`) in each file |
| Touch target expansion affects visual layout | Buttons may look too large or shift spacing | Use `min-width`/`min-height` only, preserving visual size where possible; use padding for hit area expansion |
| No functional changes | Low regression risk | Purely CSS + one new presentational component |

---

## 4. Testing Strategy

- **Manual cross-device testing:** Chrome DevTools responsive mode at 375px (phone), 768px (tablet), and 1200px+ (desktop).
- **Breakpoint boundary testing:** Resize browser across 640px and 960px thresholds; verify smooth transitions with no layout jumps.
- **Touch target verification:** Inspect computed sizes of all interactive elements at ≤960px; confirm ≥44×44px tap areas.
- **Keyboard & accessibility:** Verify hamburger menu opens/closes with Enter/Escape, focus is trapped correctly within popover, and sidebar close button is keyboard-accessible.
- **Sidebar overlay:** Confirm full-screen coverage, close button works, badge count updates, and ConfirmDialog appears above the overlay.
- **Typography:** Verify headings scale down on phone without overflow or truncation.
- **Saved page:** Confirm action buttons wrap on phone and result cards span full width.
