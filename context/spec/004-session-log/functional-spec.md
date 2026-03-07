# Functional Specification: Session Log

- **Roadmap Item:** Phase 2 — Session Log
- **Status:** Approved
- **Author:** Claude (with GM input)

---

## 1. Overview and Rationale (The "Why")

During a Vaults of Vaarn session, the GM generates multiple random results — NPCs, weapons, items — in rapid succession. Currently, each new roll replaces the previous result on screen. If the GM doesn't manually write down a result before rolling again, it's lost. This breaks the flow of play and forces the GM to context-switch between the app and their notes.

The **Session Log** solves this by automatically capturing every generated result into a persistent, organized sidebar panel. The GM can stay focused on the game, confident that every roll is recorded. At any point, they can review what they've generated, remove unwanted entries, and export the entire log as text for their session notes.

**Success looks like:** The GM uses the session log as their primary record of generated content during play, eliminating the need to manually transcribe results.

---

## 2. Functional Requirements (The "What")

### 2.1 Auto-Capture Results

- Every time the user rolls on a table set, the generated result is automatically added to the session log.
- No manual "add to log" action is required — logging is automatic.
  - **Acceptance Criteria:**
    - [ ] When the user clicks "Roll" on any table set, the result appears in the session log sidebar.
    - [ ] Re-rolling on the same table set adds a new, separate entry (does not overwrite the previous one).

### 2.2 Sidebar Panel

- The session log is displayed in a collapsible sidebar panel alongside the main content area.
- The sidebar can be opened and closed without navigating away from the current page.
- The sidebar header displays a count of total logged results (e.g., "Session Log (12)").
- When the sidebar is collapsed, a visual indicator (badge, dot, or pulse) appears when new results are added, alerting the GM that new entries have been logged.
  - **Acceptance Criteria:**
    - [ ] The sidebar is accessible from any page in the app (category list, table set view).
    - [ ] The sidebar can be toggled open/closed via a button.
    - [ ] The result count in the header updates immediately when a new result is added or an entry is deleted.
    - [ ] When the sidebar is collapsed and a new roll is made, a visual indicator appears on the sidebar toggle button.
    - [ ] The visual indicator clears when the user opens the sidebar.

### 2.3 Organized by Category & Table Set

- Results in the session log are grouped by **category** (e.g., NPCs, Weapons/Items) and then by **table set** (e.g., "Vaarn NPC Generator").
- Within each group, the **newest result appears first** (at the top).
- Groups themselves are ordered by **most recently used** — the group that received the latest roll appears at the top.
  - **Acceptance Criteria:**
    - [ ] Results are visually grouped under category and table set headings.
    - [ ] The most recent result within a group appears at the top of that group.
    - [ ] After rolling on a different table set, that table set's group moves to the top of the log.

### 2.4 Delete Individual Entries

- Each log entry has a remove/delete action allowing the GM to discard unwanted results.
  - **Acceptance Criteria:**
    - [ ] Each entry displays a delete action (e.g., an "X" button or trash icon).
    - [ ] Deleting an entry removes it from the log immediately.
    - [ ] If all entries in a group are deleted, the group heading is also removed.
    - [ ] The result count in the header updates after deletion.

### 2.5 Clear Entire Log

- The user can clear the entire session log at once via a "Clear Log" action.
- A confirmation is required before clearing to prevent accidental data loss.
  - **Acceptance Criteria:**
    - [ ] A "Clear Log" button is available in the sidebar.
    - [ ] Clicking "Clear Log" shows a confirmation prompt (e.g., "Clear all logged results?").
    - [ ] Upon confirmation, all entries are removed and the count resets to zero.
    - [ ] If the user cancels, the log remains unchanged.

### 2.6 Persistence

- The session log persists across page refreshes and browser tab closures using browser local storage.
- The log is only cleared when the user explicitly clears it.
  - **Acceptance Criteria:**
    - [ ] After generating results and refreshing the page, all session log entries are still present.
    - [ ] After closing and reopening the browser tab, all session log entries are still present.
    - [ ] Grouping and ordering are preserved after refresh.

### 2.7 Export as Text

- The user can export the session log in two ways: **copy to clipboard** and **download as a .txt file**.
- The export format is **plain text with headers** — category and table set names as headers, with results listed underneath.
  - **Acceptance Criteria:**
    - [ ] A "Copy to Clipboard" button copies the formatted log text and shows a confirmation message (e.g., "Copied!").
    - [ ] A "Download" button saves the log as a `.txt` file to the user's device.
    - [ ] The exported text includes category and table set headers with results listed under each.
    - [ ] If the session log is empty, the export actions are disabled or hidden.

---

## 3. Scope and Boundaries

### In-Scope

- Automatic capture of all roll results to the session log.
- Collapsible sidebar panel with result count and new-entry indicator.
- Grouping by category and table set, ordered by most recent activity.
- Individual entry deletion and full log clearing (with confirmation).
- Persistence via browser local storage.
- Export as plain text (copy to clipboard and file download).

### Out-of-Scope

- **Save Individual Results** — saving/bookmarking specific results to a persistent collection is a separate roadmap item.
- **Responsive Layout** — Phase 3 roadmap item.
- **Favorites/Pinned Tables** — Phase 3 roadmap item.
- **Markdown or other export formats** — plain text with headers only for now.
- **Session history / multiple sessions** — there is one log that persists until manually cleared; no concept of separate named sessions.
