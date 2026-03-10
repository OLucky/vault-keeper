# Tasks: Player Character Ability Scores

- [x] **Slice 1: Computed table type system and dice function**
  - [x] Update `src/lib/types.ts`: Add `ComputeSchema` (with `dice` and `method` fields), add `type` discriminator to `TableSchema` as a union of lookup and computed variants. Ensure backward compatibility — tables without `type` default to lookup. Add `computed?: boolean` flag to `ResultField` interface. **[Agent: general-purpose]**
  - [x] Update `src/lib/dice.ts`: Add `rollComputed(dice: string, method: string): number` function that parses `NdX` format, rolls N dice, and applies aggregation method (`"lowest"` → `Math.min`). **[Agent: general-purpose]**
  - [x] Add unit tests in `src/lib/__tests__/dice.test.ts`: Test `rollComputed` returns value in valid range (1-6 for 3d6 lowest); test with mocked `Math.random` for deterministic results; test invalid dice format throws; test unknown method throws. **[Agent: general-purpose]**
  - [x] Add unit tests in `src/lib/__tests__/types.test.ts`: Test computed table schema parses correctly; test lookup tables (with and without explicit `type`) still parse; test invalid computed tables (missing `compute`, bad `method`) fail validation. **[Agent: general-purpose]**

- [x] **Slice 2: Rolling engine handles computed tables**
  - [x] Update `src/lib/rolling.ts`: Modify `rollSingleTable()` to check table type — if computed, call `rollComputed()` and return a `ResultField` with `entry.title` set to the computed number as a string, and `computed: true`. **[Agent: general-purpose]**
  - [x] Add unit tests in `src/lib/__tests__/rolling.test.ts`: Test `rollTableSet()` with a mixed table set (one lookup + one computed); verify computed fields have `computed: true`; verify computed fields produce numeric string titles; verify lookup tables still work unchanged. **[Agent: general-purpose]**

- [x] **Slice 3: Validation supports computed tables**
  - [x] Update `src/lib/validation.ts`: Skip range coverage validation for computed tables; add validation for the `compute` object (dice format matches `NdX`, method is `"lowest"`). **[Agent: general-purpose]**
  - [x] Add unit tests in `src/lib/__tests__/validation.test.ts` (or existing validation tests): Test computed-only table set passes validation; test mixed table set passes; test malformed compute object fails (bad dice format, unknown method). **[Agent: general-purpose]**

- [x] **Slice 4: Player Character table data and UI integration**
  - [x] Update `public/tables/character/player-character.json`: Add six computed tables (Strength, Dexterity, Constitution, Intellect, Psyche, Ego) with `{ "type": "computed", "compute": { "dice": "3d6", "method": "lowest" } }` after the Ancestry table. **[Agent: general-purpose]**
  - [x] Update `src/components/ResultCard/ResultCard.tsx`: Add `field.computed` to the condition that hides the reroll button (alongside existing `field.triggered` check). **[Agent: general-purpose]**
  - [x] Verify end-to-end: Run the app, navigate to Character → Player Character, click Roll. Confirm Ancestry + 6 ability scores appear. Confirm ability scores show numeric values (1-6). Confirm no reroll buttons on ability score fields. Confirm ancestry triggers still work. Confirm session log captures the full result. **[Agent: general-purpose]**
