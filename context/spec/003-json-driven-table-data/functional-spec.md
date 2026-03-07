# Functional Specification: JSON-Driven Table Data

- **Roadmap Item:** JSON-Driven Table Data — Define a JSON schema for table sets that supports single and multi-table rolls; ship with placeholder/example table data.
- **Status:** Completed
- **Author:** Poe

---

## 1. Overview and Rationale (The "Why")

The entire content of Vault Keeper — every category, table set, and rollable entry — is defined in JSON files. This is a deliberate design choice: the GM (and sole user) should be able to add, edit, or extend content by simply editing JSON files, without touching application code. This spec defines the data format contract that the browsing UI (spec 001) and rolling engine (spec 002) both depend on.

**Success looks like:** Adding a new category with table sets takes under 10 minutes, requires editing only JSON files (plus the root manifest), and the new content appears in the app without a rebuild.

---

## 2. Functional Requirements (The "What")

### 2.1. File Organization

- All table data lives under `public/tables/`.
- Each category has its own subfolder (e.g., `public/tables/npcs/`, `public/tables/weapons-items/`).
- Each category folder contains:
  - An **`index.json`** file that declares the category name and lists its table set files.
  - One or more **table set JSON files** (e.g., `npc-generator.json`).
- A **root manifest** at `public/tables/manifest.json` lists all category folder names. The app reads this to discover categories.

**File structure:**
```
public/tables/
  manifest.json
  npcs/
    index.json
    npc-generator.json
    npc-background.json
  weapons-items/
    index.json
    weapon-generator.json
    item-generator.json
```

**Acceptance Criteria:**
- [x] A root `manifest.json` exists at `public/tables/manifest.json` listing all category folder names.
- [x] Each category folder contains an `index.json` and one or more table set JSON files.
- [x] The app reads `manifest.json` to discover category folders, then reads each folder's `index.json` to discover table sets.
- [x] Adding a new category folder with an `index.json` and table set files, plus adding the folder name to `manifest.json`, causes the new category to appear in the app without code changes.

### 2.2. Root Manifest Format (`manifest.json`)

```json
{
  "categories": ["npcs", "weapons-items"]
}
```

- **`categories`** — an array of folder names under `public/tables/`. Each entry corresponds to a category subfolder.

**Acceptance Criteria:**
- [x] The app fetches and parses `manifest.json` on startup.
- [x] Only categories listed in `manifest.json` are loaded.

### 2.3. Category Index Format (`index.json`)

```json
{
  "name": "NPCs",
  "tableSets": [
    "npc-generator.json",
    "npc-background.json"
  ]
}
```

- **`name`** — the display name of the category shown in the UI.
- **`tableSets`** — an array of table set file names within this folder.

**Acceptance Criteria:**
- [x] The app fetches each category's `index.json` to get the display name and list of table set files.
- [x] The category name in the UI matches the `name` field from `index.json`.
- [x] Only table sets listed in `tableSets` are loaded.

### 2.4. Table Set Format

```json
{
  "name": "NPC Generator",
  "tables": [
    {
      "name": "Race",
      "die": "d6",
      "entries": [
        { "range": [1, 2], "title": "True-Kin" },
        {
          "range": [3, 4],
          "title": "Cacogen (Mutant)",
          "triggers": [
            { "tableId": "mutations" },
            { "tableSet": "mutations/mutation-generator" }
          ]
        },
        { "range": [5, 6], "title": "Synth" }
      ]
    },
    {
      "name": "Mutations",
      "id": "mutations",
      "conditional": true,
      "die": "d8",
      "entries": [
        { "range": [1, 2], "title": "Extra limb" },
        { "range": [3, 4], "title": "Bioluminescent skin" },
        {
          "range": [5, 6],
          "title": "Acidic blood",
          "description": "Deals damage to attackers in melee"
        },
        { "range": [7, 8], "title": "Camouflage" }
      ]
    },
    {
      "name": "Name",
      "die": "d6",
      "entries": [
        { "range": [1, 1], "title": "Zara" },
        { "range": [2, 2], "title": "Kael" },
        { "range": [3, 3], "title": "Mox" },
        { "range": [4, 4], "title": "Fen" },
        { "range": [5, 5], "title": "Yurl" },
        { "range": [6, 6], "title": "Tev" }
      ]
    }
  ]
}
```

**Table set fields:**
- **`name`** — the display name of the table set (shown on the category page).
- **`tables`** — an array of individual tables. A table set can contain one or many tables.

**Table fields:**
- **`name`** — the label for this table (shown as the field label in results).
- **`id`** — optional. A unique identifier within the table set, used by triggers to reference this table.
- **`die`** — the die type: `d4`, `d6`, `d8`, `d10`, `d12`, `d20`, or `d100`.
- **`conditional`** — optional, defaults to `false`. When `true`, this table is NOT rolled by default — it is only rolled when triggered by an entry in another table.
- **`entries`** — an array of entry objects. Entries must collectively cover all values from 1 to the die's maximum (no gaps, no overlaps).

**Entry fields:**
- **`range`** — `[min, max]` (inclusive). A single die result uses `[n, n]`. A multi-result entry uses `[min, max]` (e.g., `[1, 2]` means die results 1 and 2 both map to this entry).
- **`title`** — required. The primary text of the entry.
- **`description`** — optional. Additional detail about the entry.
- **`triggers`** — optional. An array of trigger objects that cause additional tables to be rolled when this entry is selected.

**Trigger modes:**

A trigger object can reference tables in three ways:

1. **Same-file table:** `{ "tableId": "mutations" }` — rolls the table with the matching `id` in the current table set.
2. **Cross-file specific table:** `{ "tableSet": "mutations/mutation-generator", "tableId": "physical-mutations" }` — rolls a specific table in another table set. The `tableSet` value is the path `category-folder/table-set-filename` (without `.json`).
3. **Cross-file entire table set:** `{ "tableSet": "mutations/mutation-generator" }` — rolls all non-conditional tables in the referenced table set.

**Acceptance Criteria:**
- [x] The app correctly parses table set files with the structure defined above.
- [x] Tables support die types: d4, d6, d8, d10, d12, d20, d100.
- [x] Entries use `range` to map one or more die results to a single entry.
- [x] The rolling engine generates a random number from 1 to the die's max and selects the entry whose range includes that number.
- [x] Entries with a `description` display both title and description in results.
- [x] Entries without a `description` display only the title.
- [x] Tables marked `conditional: true` are not rolled by default.
- [x] When a selected entry has `triggers`, each trigger is evaluated and the referenced table(s) are rolled.
- [x] Trigger mode 1: `{ "tableId": "..." }` correctly rolls a table in the same table set.
- [x] Trigger mode 2: `{ "tableSet": "...", "tableId": "..." }` correctly fetches and rolls a specific table from another table set.
- [x] Trigger mode 3: `{ "tableSet": "..." }` correctly fetches and rolls all non-conditional tables from another table set.
- [x] Triggered results appear as additional fields in the generated result, alongside the non-conditional fields.

### 2.5. Data Validation and Error Handling

- The app validates JSON data at runtime when files are fetched.
- If a file is missing, malformed, or has invalid data, a **user-friendly error message** is displayed in the UI in place of the expected content.
- Validation checks include:
  - JSON parse errors (malformed JSON).
  - Missing required fields (`name`, `tables`, `die`, `entries`, `range`, `title`).
  - Invalid die type (not one of the supported values).
  - Entry ranges that don't fully cover 1 to the die's max (gaps or overlaps).
  - Trigger references to non-existent table IDs or table set paths.
- A single broken file should not crash the entire app — other categories and table sets should still function.

**Acceptance Criteria:**
- [x] If a JSON file fails to parse, a user-friendly error is shown where that content would appear.
- [x] If required fields are missing, an error is shown identifying the issue.
- [x] If a die type is not one of the supported values, an error is shown.
- [x] If entry ranges don't fully cover the die's range (gaps or overlaps), an error is shown.
- [x] If a trigger references a non-existent table ID or table set, an error is shown.
- [x] A broken file does not prevent other categories or table sets from loading.

### 2.6. Sample Content

- V1 ships with **2-3 sample table sets per category** using placeholder content:
  - **NPCs:** e.g., "NPC Generator" (race + name + trait + motivation, with conditional mutations table triggered by race), "NPC Appearance" (build + clothing + distinguishing feature).
  - **Weapons/Items:** e.g., "Weapon Generator" (type + material + condition), "Trade Goods" (item + value + origin).
- Sample data uses a variety of die sizes (d6, d10, d20) and entry formats (single-result ranges, multi-result ranges, entries with and without descriptions, conditional tables with triggers) to exercise the full schema.

**Acceptance Criteria:**
- [x] The app ships with at least 2 sample table sets for the NPCs category.
- [x] The app ships with at least 2 sample table sets for the Weapons/Items category.
- [x] Sample data includes tables with different die sizes.
- [x] Sample data includes entries with and without descriptions.
- [x] Sample data includes entries with multi-result ranges (e.g., `[1, 2]`).
- [x] Sample data includes at least one conditional table with triggers.
- [x] Sample data includes at least one cross-category trigger.

---

## 3. Scope and Boundaries

### In-Scope

- Root manifest (`manifest.json`) for category discovery.
- Category index files (`index.json`) for table set discovery.
- Table set JSON format with die types, range-based entries, optional descriptions, conditional tables, and triggers.
- Three trigger modes: same-file table, cross-file specific table, cross-file entire table set.
- Runtime validation with user-friendly error messages.
- Sample/placeholder content for NPCs and Weapons/Items (2-3 table sets each).
- File organization under `public/tables/`.

### Out-of-Scope

- **Category-Based Table Browsing UI** — covered in spec 001.
- **One-Click Rolling behavior** — covered in spec 002.
- **Session Log** — Phase 2 roadmap item.
- **Save Individual Results** — Phase 2 roadmap item.
- **Responsive/mobile layout** — Phase 3 roadmap item.
- **Favorites/Pinned Tables** — Phase 3 roadmap item.
- In-app table editing or JSON authoring UI.
- JSON Schema validation tooling or CLI validators.
- Real Vaults of Vaarn content — V1 uses placeholder data only.
- Nested/chained triggers (a triggered table's entries triggering further tables) — can be considered in a future iteration.
