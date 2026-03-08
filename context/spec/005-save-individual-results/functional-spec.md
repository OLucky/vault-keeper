# Functional Specification: Save Individual Results

- **Roadmap Item:** Phase 2 — Save Individual Results
- **Status:** Approved
- **Author:** Claude (with GM input)

---

## 1. Overview and Rationale (The "Why")

The Session Log captures every roll during play, but it's designed as a transient working record. Some results — a memorable NPC, a key weapon — become important to the ongoing campaign and need to outlast a single session. Currently, the GM would need to manually copy these into external notes.

**Save Individual Results** lets the GM bookmark specific generated results into a persistent, organized collection. This collection lives in the app and serves as a personal reference library of generated content worth keeping. The GM can annotate saved results with notes for context (e.g., "The merchant from the Vaarn wastes") and review them anytime from a dedicated page.

**Success looks like:** The GM saves 2–5 results per session and refers back to them in future sessions, making the app a lasting reference tool — not just a one-time generator.

---

## 2. Functional Requirements (The "What")

### 2.1 Save a Result

- The user can save a generated result from **both** the main roll view and the session log sidebar.
- The save action is represented by a bookmark icon (or similar). Clicking it saves the result to the persistent collection.
- Results that are already saved display a **filled/active bookmark icon** in both the roll view and the session log, indicating their saved state.
  - **Acceptance Criteria:**
    - [ ] A save action (e.g., bookmark icon) is visible on the result in the roll view after generating a result.
    - [ ] A save action is visible on each entry in the session log sidebar.
    - [ ] Clicking the save action adds the result to the Saved Results collection.
    - [ ] After saving, the icon changes to a filled/active state indicating the result is saved.
    - [ ] The saved state indicator is consistent across roll view and session log (if the same result appears in both).

### 2.2 Optional Notes

- When saving a result (or at any time after), the user can add an optional text note to provide context.
- Notes are free-form text with no required format.
  - **Acceptance Criteria:**
    - [ ] After saving a result, the user is given the option to add a note (e.g., an inline text field or a prompt).
    - [ ] Notes can be added or edited later from the Saved Results page.
    - [ ] Notes are optional — a result can be saved without any note.
    - [ ] Notes are persisted alongside the saved result in local storage.

### 2.3 Saved Results Page

- A dedicated page accessible from the main navigation displays all saved results.
- Results are **grouped by category and table set**, matching the organizational pattern of the session log.
- Each saved result displays the generated content, the optional note (if any), and a delete action.
  - **Acceptance Criteria:**
    - [ ] A "Saved" link/button is present in the main navigation.
    - [ ] The Saved Results page displays all saved results grouped under category and table set headings.
    - [ ] Each entry shows the generated result content and its note (if present).
    - [ ] If there are no saved results, the page displays an empty state message (e.g., "No saved results yet").

### 2.4 Remove Saved Results

- The user can delete individual saved results from the Saved Results page.
- A confirmation prompt is shown before deletion to prevent accidental removal.
- Unsaving a result (clicking the active bookmark icon in the roll view or session log) also removes it from the collection.
  - **Acceptance Criteria:**
    - [ ] Each saved result has a delete action on the Saved Results page.
    - [ ] Clicking delete shows a confirmation prompt (e.g., "Remove this saved result?").
    - [ ] Upon confirmation, the result is removed from the collection and local storage.
    - [ ] If the user cancels, the result remains.
    - [ ] Clicking an active/filled bookmark icon in the roll view or session log unsaves the result (with confirmation).
    - [ ] After removal, the bookmark icon returns to its default/unfilled state.
    - [ ] If all results in a group are removed, the group heading is also removed.

### 2.5 Persistence

- All saved results (including notes) are persisted to browser local storage.
- Saved results persist independently of the session log — clearing the session log does not affect saved results.
  - **Acceptance Criteria:**
    - [ ] Saved results persist across page refreshes and browser tab closures.
    - [ ] Clearing the session log does not remove or affect saved results.
    - [ ] Notes persist alongside their associated saved results.

### 2.6 Export as Text

- The Saved Results page supports export via **copy to clipboard** and **download as .txt file**.
- The export format is **plain text with headers** — category and table set names as headers, with results (and their notes) listed underneath.
  - **Acceptance Criteria:**
    - [ ] A "Copy to Clipboard" button copies the formatted saved results and shows a confirmation message.
    - [ ] A "Download" button saves the saved results as a `.txt` file.
    - [ ] The exported text includes category and table set headers, result content, and notes (if present).
    - [ ] If there are no saved results, the export actions are disabled or hidden.

---

## 3. Scope and Boundaries

### In-Scope

- Save action available on both roll view and session log entries.
- Visual indicator (filled bookmark) for saved state across the UI.
- Optional free-form text notes on saved results.
- Dedicated Saved Results page with grouped display.
- Individual deletion with confirmation.
- Persistence via browser local storage, independent of session log.
- Export as plain text (copy to clipboard and file download).

### Out-of-Scope

- **Session Log** — already specified separately.
- **Custom user-defined groups or tags** — results are organized by their source category/table set only.
- **Bulk actions** (e.g., delete all, export selection) — single-item operations only.
- **Responsive Layout** — Phase 3 roadmap item.
- **Favorites/Pinned Tables** — Phase 3 roadmap item.
- **Search or filter within saved results** — not included in this version.
