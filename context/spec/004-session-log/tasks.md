# Tasks: Session Log

## Slice 1: Session Log Store with Persistence
_Create the store and verify it persists data to localStorage._

- [x] **Slice 1: Session Log Store**
  - [x] Create `src/stores/sessionLogStore.ts` with Zustand store using `persist` middleware. Include `entries` array, `sidebarOpen`, `unseenCount` state, and actions: `addEntry`, `removeEntry`, `clearAll`, `toggleSidebar`, `openSidebar`. Only `entries` should be persisted via `partialize`. **[Agent: typescript-expert]**
  - [x] Create `src/stores/__tests__/sessionLogStore.test.ts` with unit tests for all store actions: addEntry adds with timestamp, removeEntry removes by ID, clearAll empties entries, toggleSidebar toggles and resets unseenCount, unseenCount increments when sidebar is closed. **[Agent: typescript-expert]**
  - [x] Run tests and verify all pass. **[Agent: typescript-expert]**

## Slice 2: Sidebar Toggle Button in Header
_Add a toggle button to the header that opens/closes an empty sidebar panel. The app remains fully functional._

- [x] **Slice 2: Sidebar Layout & Toggle**
  - [x] Create `src/components/SidebarToggle/SidebarToggle.tsx` and `.module.css`. Button reads `sidebarOpen` and `unseenCount` from `sessionLogStore`, calls `toggleSidebar` on press. Shows a badge with unseen count when sidebar is closed and count > 0. **[Agent: react-expert]**
  - [x] Create `src/components/SessionLogSidebar/SessionLogSidebar.tsx` and `.module.css`. For now, render an empty sidebar container with a header showing "Session Log (0)" and a placeholder body. **[Agent: react-expert]**
  - [x] Modify `src/routes/__root.tsx` to add `SidebarToggle` to the nav and wrap `<main>` + `<SessionLogSidebar>` in a horizontal flex container. Sidebar renders conditionally based on `sidebarOpen`. **[Agent: react-expert]**
  - [x] Update `src/routes/Root.module.css` with styles for the new flex container layout (main area + 320px fixed-width sidebar). **[Agent: react-expert]**
  - [x] Verify: app starts, toggle button appears in header, clicking it shows/hides an empty sidebar panel, main content reflows. Existing pages (dashboard, category) still work. **[Agent: browser-mcp]**

## Slice 3: Auto-Capture Rolls to Session Log
_Rolling on a table set adds the result to the sidebar. Results are visible in the sidebar._

- [x] **Slice 3: Capture & Display Entries**
  - [x] Create `src/components/SessionLogSidebar/SessionLogEntry.tsx` and `.module.css`. Renders a single log entry's fields (reusing the field display pattern from `ResultCard`) with a delete button. **[Agent: react-expert]**
  - [x] Update `SessionLogSidebar` to read `entries` from the store, display the total count in the header, and render entries as a flat list (grouping comes in next slice). **[Agent: react-expert]**
  - [x] Modify `src/components/TableSetEntry/TableSetEntry.tsx`: in `handleRoll`, after `addRoll(storeKey, result)`, call `sessionLogStore.getState().addEntry(result, categoryId)`. **[Agent: react-expert]**
  - [x] Update `SidebarToggle` so the unseen badge appears when new entries are added while sidebar is closed during a roll, and clears when opened. **[Agent: react-expert]**
  - [x] Verify: roll on a table set, result appears in sidebar, count updates, badge shows when sidebar is closed during a roll. Refresh page — entries persist. **[Agent: browser-mcp]**

## Slice 4: Grouped Display
_Entries in the sidebar are grouped by category and table set, ordered by most recent activity._

- [x] **Slice 4: Grouping & Ordering**
  - [x] Create `src/components/SessionLogSidebar/SessionLogGroup.tsx` and `.module.css`. Renders a group heading (category — table set) and its entries. **[Agent: react-expert]**
  - [x] Update `SessionLogSidebar` to compute groups from entries using `useMemo`: group by `categoryId/tableSetName`, order groups by most recent timestamp, order entries within groups by timestamp descending. Render `SessionLogGroup` for each group. **[Agent: react-expert]**
  - [x] Verify: roll across multiple categories/table sets, confirm results appear grouped with correct headings and ordering. Rolling on a table set moves its group to the top. **[Agent: browser-mcp]**

## Slice 5: Delete Entry & Clear All
_User can remove individual entries and clear the entire log with confirmation._

- [x] **Slice 5: Delete & Clear**
  - [x] Create `src/components/ConfirmDialog/ConfirmDialog.tsx` and `.module.css`. Reusable confirmation dialog using React Aria `Dialog` + `Modal`. Props: `title`, `message`, `onConfirm`, `onCancel`, `isOpen`. **[Agent: react-expert]**
  - [x] Wire up the delete button on `SessionLogEntry` to call `sessionLogStore.removeEntry(id)`. When all entries in a group are removed, the group heading disappears. Update the count in the header. **[Agent: react-expert]**
  - [x] Add a "Clear Log" button to `SessionLogSidebar` header. Clicking it opens `ConfirmDialog`. On confirm, calls `sessionLogStore.clearAll()`. On cancel, log is unchanged. **[Agent: react-expert]**
  - [x] Write component tests for `ConfirmDialog` (confirm and cancel flows). **[Agent: react-expert]**
  - [x] Verify: delete individual entries, confirm group disappears when empty, clear all with confirmation works, count resets. **[Agent: browser-mcp]**

## Slice 6: Export as Text
_User can copy the session log to clipboard or download as .txt file._

- [x] **Slice 6: Export**
  - [x] Create `src/lib/exportSessionLog.ts` with `formatSessionLogAsText(entries: SessionLogEntry[]): string`. Groups and formats entries as plain text with category/table set headers. **[Agent: typescript-expert]**
  - [x] Create `src/lib/__tests__/exportSessionLog.test.ts` with unit tests: empty log returns empty string, single entry, multiple groups, entries with descriptions. **[Agent: typescript-expert]**
  - [x] Add "Copy to Clipboard" and "Download" buttons to `SessionLogSidebar` header. Copy uses `navigator.clipboard.writeText()` with a brief "Copied!" confirmation. Download creates a Blob and triggers a `.txt` file download. Both are disabled/hidden when log is empty. **[Agent: react-expert]**
  - [x] Verify: generate some results, copy to clipboard and paste to confirm format, download and open .txt file. Buttons are hidden when log is empty. **[Agent: browser-mcp]**
