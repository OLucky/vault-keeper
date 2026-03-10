# Add Table Sets from Book Screenshots

You are a data entry specialist for Vault Keeper, a Vaults of Vaarn GM companion app. Your job is to read screenshots of the sourcebook, extract the roll tables, and create properly formatted JSON table set files.

---

## INPUTS

- **User Prompt:** `$ARGUMENTS` — may specify a category, table set name, or instructions
- **Attached Screenshots:** The user will provide one or more screenshots of pages from the Vaults of Vaarn sourcebook containing roll tables

---

## PROCESS

### Step 1: Read the Screenshots

1. Read every attached screenshot carefully. Identify all roll tables present.
2. For each table, extract:
   - **Table name** (the heading or label, e.g., "Ancestry", "d20 Mutations")
   - **Die type** (d4, d6, d8, d10, d12, d20, or d100 — look for "d20", "1d6", etc. in the header or infer from row count)
   - **Entries** — every row with its number/range and text content
3. Note any tables that seem related (e.g., a "Race" table that says "if Cacogen, roll on Mutations table") — these indicate **triggers**.
4. If the text is unclear or partially obscured, flag it and ask the user before guessing.

### Step 2: Determine Category and File Structure

1. If `$ARGUMENTS` specifies a category (e.g., "creatures", "locations"), use it.
2. If not, analyze the table content and suggest a category. Ask the user to confirm.
3. Check if the category already exists by reading `public/tables/manifest.json`.
4. Determine the **table set name** — either from `$ARGUMENTS` or from the page heading. Use kebab-case for the file name (e.g., "Creature Generator" → `creature-generator.json`).

### Step 3: Build the JSON

Create the table set JSON following this exact schema:

```json
{
  "name": "Display Name Here",
  "tables": [
    {
      "name": "Table Name",
      "die": "d20",
      "entries": [
        { "range": [1, 1], "title": "Entry text" },
        { "range": [2, 3], "title": "Entry text", "description": "Optional extra detail" },
        ...
      ]
    }
  ]
}
```

**Rules:**

- **`die`** must be one of: `d4`, `d6`, `d8`, `d10`, `d12`, `d20`, `d100`
- **`range`** is always a two-element array `[low, high]`. Single entries use `[n, n]`.
- **Ranges must cover every value from 1 to die max** with no gaps and no overlaps. This is validated at runtime — errors will break the app.
- **`title`** is the primary result text (short, punchy). Keep it concise.
- **`description`** is optional — use it for flavor text, mechanical notes, or clarifications that appear in the book alongside the entry. Do not invent descriptions that aren't in the source material.
- **`triggers`** (optional) — use when one table result should cascade into another roll:
  - Same-file trigger: `{ "tableId": "table-id" }` — reference a table's `id` field in the same file
  - Cross-file trigger: `{ "tableSet": "category/filename" }` — reference a table set in another file (omit `.json`)
  - The triggered table must have `"conditional": true` and an `"id"` field
- **`conditional`** tables are only rolled when triggered. They are NOT rolled by default.
- **`id`** is only needed on tables that are referenced by triggers.

**Handling book formatting quirks:**

- If the book uses "1–3" or "1-3" for a range, convert to `[1, 3]`
- If the book has sub-entries (e.g., "1. Sword — a) Rusty b) Sharp"), flatten into a single entry with the sub-detail in `description`
- If a table has a "Roll twice" or "Roll again" entry, keep it as a regular entry (the app doesn't support re-rolls within tables)
- If the die type isn't explicitly stated, count the entries and pick the matching die (6 entries → d6, 20 entries → d20, etc.)
- If entries have uneven ranges (e.g., 1-3 and 4-6 on a d6), preserve the ranges exactly as printed

### Step 4: Present for Review

Show the user:
1. The complete JSON file content
2. Which category it will go in (new or existing)
3. The file name
4. Any decisions you made (e.g., "I merged sub-tables", "I interpreted this blurry entry as X")
5. Any tables where triggers were identified

Ask: **"Does this look correct? I can adjust entries, split/merge tables, or change the category before saving."**

### Step 5: Save and Register

Once the user approves:

1. **Write the table set JSON** to `public/tables/{category}/{filename}.json`
2. **Update the category index** at `public/tables/{category}/index.json`:
   - If the category exists: read the file, add the new filename to the `tableSets` array, write it back
   - If the category is new: create `index.json` with `{ "name": "Category Display Name", "tableSets": ["filename.json"] }`
3. **Update the manifest** at `public/tables/manifest.json` (only if adding a new category):
   - Read the file, add the new category ID to the `categories` array, write it back
4. **Validate** by running: `cd "/Users/gishchenko/Documents/Work/Projects/Vaults of Vaarn GM Tools" && npx tsc --noEmit`

### Step 6: Announce

Report what was created:
- File path and table set name
- Number of tables and total entries
- Category (new or existing)
- Any trigger connections

---

## REFERENCE: Existing Data

**Categories:** Read `public/tables/manifest.json` for current list.

**Die types:** d4 (4), d6 (6), d8 (8), d10 (10), d12 (12), d20 (20), d100 (100)

**Validation:** Ranges must cover 1 to die-max completely. The app validates this at runtime via `src/lib/validation.ts` and will show an error if ranges have gaps or overlaps.

**Example — simple table set:**
```json
{
  "name": "Trade Goods",
  "tables": [
    {
      "name": "Item",
      "die": "d10",
      "entries": [
        { "range": [1, 1], "title": "Water purifier", "description": "Solar-powered, slow but reliable" },
        { "range": [2, 2], "title": "Fungal spores" },
        ...
        { "range": [10, 10], "title": "Psyche crystal" }
      ]
    },
    {
      "name": "Value",
      "die": "d6",
      "entries": [
        { "range": [1, 2], "title": "Worthless", "description": "Good only for barter with the desperate" },
        { "range": [3, 4], "title": "Common" },
        { "range": [5, 5], "title": "Valuable" },
        { "range": [6, 6], "title": "Priceless", "description": "Worth killing for" }
      ]
    }
  ]
}
```

**Example — table set with triggers:**
```json
{
  "name": "NPC Generator",
  "tables": [
    {
      "name": "Race",
      "die": "d6",
      "entries": [
        { "range": [1, 1], "title": "True-Kin", "description": "Pure human lineage" },
        { "range": [2, 3], "title": "Cacogen/Mutant", "triggers": [{ "tableId": "mutations" }] },
        { "range": [4, 6], "title": "Synth" }
      ]
    },
    {
      "name": "Mutation",
      "id": "mutations",
      "conditional": true,
      "die": "d6",
      "entries": [
        { "range": [1, 1], "title": "Extra Limb" },
        ...
      ]
    }
  ]
}
```
