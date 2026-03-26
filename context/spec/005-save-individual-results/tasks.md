# Tasks: Save Individual Results

_Prerequisite: Session Log (004) tasks must be completed first._

## Slice 1: Saved Results Store with Persistence

_Create the store and verify it persists data to localStorage independently from session log._

- [x] **Slice 1: Saved Results Store**
  - [x] Create `src/stores/savedResultsStore.ts` with Zustand store using `persist` middleware (key: `"vault-keeper-saved-results"`). Include `savedResults` array and actions: `saveResult`, `removeResult`, `updateNote`, `isSaved`. `saveResult` should no-op if the ID already exists. **[Agent: typescript-expert]**
  - [x] Create `src/stores/__tests__/savedResultsStore.test.ts` with unit tests: saveResult adds with timestamp and empty note, removeResult removes by ID, updateNote updates note text, isSaved returns correct boolean, duplicate save is a no-op, persistence works. **[Agent: typescript-expert]**
  - [x] Run tests and verify all pass. **[Agent: typescript-expert]**

## Slice 2: Bookmark Icon on ResultCard

_Add a save/unsave bookmark icon to ResultCard. Visible in both roll view and session log sidebar._

- [x] **Slice 2: Save Action on Results**
  - [x] Modify `src/components/ResultCard/ResultCard.tsx`: add optional props `isSaved`, `onSave`, `onUnsave`. When provided, render a bookmark `ToggleButton` (React Aria) that shows filled/unfilled state based on `isSaved`. Clicking unfilled calls `onSave(result.id)`. Clicking filled triggers `ConfirmDialog` before calling `onUnsave(result.id)`. **[Agent: react-expert]**
  - [x] Modify `src/components/TableSetEntry/TableSetEntry.tsx`: read `isSaved` from `savedResultsStore` for each stacked result, pass `onSave`/`onUnsave` callbacks to `ResultCard` that call `savedResultsStore.saveResult()` and `savedResultsStore.removeResult()`. **[Agent: react-expert]**
  - [x] Modify `src/components/SessionLogSidebar/SessionLogEntry.tsx`: same pattern — read saved state from `savedResultsStore`, pass save/unsave callbacks to the result display. **[Agent: react-expert]**
  - [x] Verify: roll a result, bookmark icon appears. Click to save — icon fills. Icon state is consistent between roll view and session log. Click filled icon — confirmation dialog appears, confirm unsaves. Refresh — saved state persists. **[Agent: browser-mcp]**

## Slice 3: Saved Results Page with Grouped Display

_A dedicated /saved route showing all saved results grouped by category and table set._

- [x] **Slice 3: Saved Results Page**
  - [x] Create `src/routes/saved.tsx` as a new TanStack Router file-based route. Read all saved results from `savedResultsStore`, group by `categoryId/tableSetName` (same grouping logic as session log), render groups with headings and entries. Show empty state message when no results are saved. **[Agent: react-expert]**
  - [x] Create `src/components/SavedResultCard/SavedResultCard.tsx` and `.module.css`. Displays a saved result's fields and a delete button. Clicking delete opens `ConfirmDialog`, on confirm calls `savedResultsStore.removeResult(id)`. Group heading disappears when all entries in the group are removed. **[Agent: react-expert]**
  - [x] Modify `src/routes/__root.tsx`: add a "Saved" link to the `<nav>` in the header, pointing to `/saved`. **[Agent: react-expert]**
  - [x] Verify: save some results from the roll view, navigate to /saved via header link, results appear grouped. Delete a saved result with confirmation. Empty state shows when all are removed. **[Agent: browser-mcp]**

## Slice 4: Inline Note Editing

_User can add and edit notes on saved results from the Saved page._

- [x] **Slice 4: Notes**
  - [x] Create `src/components/InlineNoteEditor/InlineNoteEditor.tsx` and `.module.css`. Click-to-edit text field using React Aria `TextField`. Shows placeholder ("Add a note...") when empty. On blur or Enter, calls `savedResultsStore.updateNote(id, note)`. **[Agent: react-expert]**
  - [x] Integrate `InlineNoteEditor` into `SavedResultCard`. Each saved result shows its note (or the placeholder) below the fields. **[Agent: react-expert]**
  - [x] Verify: save a result, go to /saved, click "Add a note...", type a note, click away — note persists. Edit an existing note. Refresh — note is still there. **[Agent: browser-mcp]**

## Slice 5: Export Saved Results as Text

_User can copy saved results to clipboard or download as .txt file, including notes._

- [x] **Slice 5: Export**
  - [x] Create `src/lib/exportSavedResults.ts` with `formatSavedResultsAsText(results: SavedResult[]): string`. Groups and formats results as plain text with category/table set headers, result fields, and notes (if present). **[Agent: typescript-expert]**
  - [x] Create `src/lib/__tests__/exportSavedResults.test.ts` with unit tests: empty collection returns empty string, single result, multiple groups, results with and without notes. **[Agent: typescript-expert]**
  - [x] Add "Copy to Clipboard" and "Download" buttons to the Saved Results page. Same pattern as session log export. Both are disabled/hidden when there are no saved results. **[Agent: react-expert]**
  - [x] Verify: save some results with notes, copy to clipboard and paste to confirm format includes notes, download .txt file. Buttons hidden when collection is empty. **[Agent: browser-mcp]**
