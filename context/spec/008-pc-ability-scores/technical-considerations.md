# Technical Specification: Player Character Ability Scores

- **Functional Specification:** `context/spec/008-pc-ability-scores/functional-spec.md`
- **Status:** Completed
- **Author(s):** Claude

---

## 1. High-Level Technical Approach

Introduce a **computed table type** to the existing JSON-driven table system. Currently, all tables are "lookup" tables — roll a die, find the matching entry by range. Computed tables define a dice formula and an aggregation method (e.g., "roll 3d6, take lowest") and produce a numeric result directly, with no entry lookup.

The Player Character table set (`public/tables/character/player-character.json`) will gain six computed tables — one per ability score. The rolling engine will detect computed tables and delegate to a new dice computation function. The UI requires no changes since `ResultField.entry.title` already renders as a generic string.

**Affected files:**
- `src/lib/types.ts` — schema changes (new table variant)
- `src/lib/dice.ts` — new computed dice function
- `src/lib/rolling.ts` — handle computed tables in `rollSingleTable()`
- `src/lib/validation.ts` — skip range coverage for computed tables
- `public/tables/character/player-character.json` — add six ability tables

---

## 2. Proposed Solution & Implementation Plan

### 2.1 Data Model / Schema Changes (`src/lib/types.ts`)

Add a discriminated union for tables using an optional `type` field:

- **Lookup table** (existing, default): Has `die` (DieType) and `entries` (Entry[]). The `type` field is omitted or `"lookup"`.
- **Computed table** (new): Has `type: "computed"` and a `compute` object instead of `die`+`entries`.

**`compute` object shape:**

| Field    | Type   | Description                           |
|----------|--------|---------------------------------------|
| `dice`   | string | Dice expression, e.g. `"3d6"`        |
| `method` | string | Aggregation: `"lowest"` (extensible)  |

The `TableSchema` becomes a Zod discriminated union on the `type` field. Existing tables without a `type` field default to `"lookup"` behavior.

**Backward compatibility:** All existing JSON files have no `type` field. The schema must treat missing `type` as `"lookup"` — no existing files need modification.

### 2.2 Dice Module (`src/lib/dice.ts`)

Add a new function:

- `rollComputed(dice: string, method: string): number`
  - Parses `dice` string (format: `NdX`, e.g. `"3d6"`)
  - Rolls N dice of size X
  - Applies `method`: `"lowest"` → returns `Math.min(...rolls)`
  - Throws on unrecognized method

### 2.3 Rolling Engine (`src/lib/rolling.ts`)

Modify `rollSingleTable()` to check the table type:

- If **lookup** (or no type): existing behavior — `rollDie()` → `findEntry()` → return `ResultField`
- If **computed**: call `rollComputed(table.compute.dice, table.compute.method)` → return `ResultField` with `entry.title` set to the string representation of the computed number (e.g. `"2"`)

Computed table fields will have **no reroll button**. This is achieved by marking them similarly to triggered fields (setting a flag that the UI checks to hide the reroll button). The simplest approach: add a `computed: true` flag to `ResultField`, and check it in `ResultCard` alongside the existing `triggered` check.

### 2.4 Validation (`src/lib/validation.ts`)

Update `validateTableSet()` to skip range coverage validation for computed tables (they have no entries/ranges to validate). Validate the `compute` object shape instead:
- `dice` matches format `NdX` (e.g. `"3d6"`)
- `method` is one of the supported values (`"lowest"`)

### 2.5 Table Data (`public/tables/character/player-character.json`)

Add six computed tables after the existing Ancestry table:

```json
{ "name": "Strength", "type": "computed", "compute": { "dice": "3d6", "method": "lowest" } },
{ "name": "Dexterity", "type": "computed", "compute": { "dice": "3d6", "method": "lowest" } },
{ "name": "Constitution", "type": "computed", "compute": { "dice": "3d6", "method": "lowest" } },
{ "name": "Intellect", "type": "computed", "compute": { "dice": "3d6", "method": "lowest" } },
{ "name": "Psyche", "type": "computed", "compute": { "dice": "3d6", "method": "lowest" } },
{ "name": "Ego", "type": "computed", "compute": { "dice": "3d6", "method": "lowest" } }
```

---

## 3. Impact and Risk Analysis

**System Dependencies:**
- `ResultCard` component reads `field.entry.title` and optionally shows a reroll button. Adding a `computed` flag to `ResultField` means updating the reroll-button visibility check (minor).
- Session log, saved results, and dashboard recent rolls all render `ResultField` — they work unchanged since they display `entry.title` generically.
- `rerollFieldWithTriggers()` is not called for computed fields (no reroll button), so no changes needed there.

**Potential Risks & Mitigations:**
- **Schema backward compatibility:** Existing JSON files have no `type` field. Mitigation: the Zod schema defaults missing `type` to `"lookup"`, so no existing files break.
- **Validation bypass:** Computed tables skip range coverage checks. Mitigation: validate `compute` object shape (dice format, known method) to catch malformed data.
- **Future extensibility:** The `method` field is a string enum. New methods (e.g., `"highest"`, `"sum"`) can be added later without schema changes.

---

## 4. Testing Strategy

- **Unit tests for `rollComputed()`** (`src/lib/__tests__/dice.test.ts`): Test 3d6 lowest returns a value 1-6; test with mocked random for deterministic results; test invalid dice format and unknown method throw errors.
- **Unit tests for rolling engine** (`src/lib/__tests__/rolling.test.ts`): Test `rollTableSet()` with a table set containing both lookup and computed tables; verify computed fields have correct structure; verify computed fields are not re-rollable.
- **Unit tests for validation** (`src/lib/__tests__/validation.test.ts`): Test computed tables pass validation; test malformed compute objects fail; test mixed table sets (lookup + computed) validate correctly.
- **Integration:** Verify the full Player Character roll produces Ancestry + 6 ability scores, and that triggered ancestry sub-tables still work alongside computed fields.
