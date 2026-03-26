# Technical Specification: Vaarn Weather Simulator

- **Functional Specification:** `context/spec/010-weather-simulator/functional-spec.md`
- **Status:** Completed
- **Author(s):** Claude

---

## 1. High-Level Technical Approach

The weather simulator is a self-contained feature with three main parts:

1. **Hex grid data model** — A TypeScript constant encoding the book's hex chart: hex positions, weather types, neighbor relationships, boundary rules (X-edges and wrap-around).
2. **Movement engine** — Pure functions that take a current hex position + d6 roll and return the new position, respecting X-boundary blocking and edge wrapping.
3. **Visual hex grid** — An SVG-based interactive component that renders the hex chart, highlights the current marker, and supports click-to-place.
4. **Persistence** — A Zustand store with `persist` middleware to save the marker position to local storage.

No changes to the existing table-rolling system. This is a new, independent feature accessed via a dedicated `/weather` route.

---

## 2. Proposed Solution & Implementation Plan (The "How")

### Hex Coordinate System

Use **offset coordinates (odd-r)** — rows are numbered top-to-bottom, columns left-to-right. Odd rows are shifted right by half a hex width. This maps naturally to the book's visual layout.

Each hex is identified by `{ row: number, col: number }`.

### Grid Data (`src/lib/weatherGrid.ts`)

A typed constant encoding the full hex chart:

- **`WeatherType` enum** — `Still`, `Hazy`, `DustStorm`, `SandStorm`, `Heatwave`, `WormPollen`, `Rain`, `PrismaticTempest`
- **`HexCell` type** — `{ row: number, col: number, weather: WeatherType }`
- **`GRID_CELLS: HexCell[]`** — Array of all hexes in the chart, transcribed from the book's hex map.
- **`START_HEX`** — The center "Start" hex coordinates.
- **`BLOCKED_EDGES`** — Set of edge positions marked X where wrapping is blocked.
- **`WEATHER_EFFECTS: Record<WeatherType, { name: string, description: string }>`** — Full rules text for each weather type.

### Neighbor & Movement Logic (`src/lib/weatherMovement.ts`)

Pure functions, fully unit-testable:

- **`getNeighbor(hex, direction): HexCell | null`** — Given a hex and d6 direction (1–6), returns the neighboring hex. Returns `null` if the neighbor is off-grid.
- **`resolveMove(hex, direction, grid): HexCell`** — The core movement function:
  1. Get the neighbor in the rolled direction.
  2. If the neighbor exists in the grid → move there.
  3. If off-grid and the edge is NOT X-blocked → wrap to opposite side.
  4. If off-grid and the edge IS X-blocked → stay in current hex.
- **`getWrappedHex(hex, direction, grid): HexCell | null`** — Finds the wrap-around target by traversing from the opposite edge.

Direction mapping (from book's diagram):
| d6 | Direction |
|----|-----------|
| 1 | Upper-left |
| 2 | Upper-right |
| 3 | Right |
| 4 | Lower-right |
| 5 | Lower-left |
| 6 | Left |

### Zustand Store (`src/stores/weatherStore.ts`)

Following the existing persist pattern (like `favoritesStore.ts`):

- **State:**
  - `markerPosition: { row: number, col: number }` — current hex
  - `lastRoll: { value: number, direction: string } | null` — most recent d6 result for display
- **Actions:**
  - `advanceDay()` — rolls d6, calls `resolveMove`, updates `markerPosition` and `lastRoll`
  - `placeMarker(row, col)` — manual placement, clears `lastRoll`
  - `reset()` — returns marker to `START_HEX`, clears `lastRoll`
- **Persist config:** `{ name: 'vault-keeper-weather', partialize: (state) => ({ markerPosition: state.markerPosition }) }`

### Route (`src/routes/weather.tsx`)

A new file-based route at `/weather`. No loader needed — all data is in TypeScript constants, no fetching required.

### Dashboard Integration (`src/routes/index.tsx`)

Add a "Weather" card/link on the dashboard. This could be a new "Tools" section or simply a prominent link alongside the category cards.

### Components

- **`src/components/HexGrid/HexGrid.tsx`** + `.module.css` — SVG hex grid renderer.
  - Renders all hex cells as `<polygon>` elements, colored/patterned by weather type.
  - Highlights the marker hex with a distinct border or overlay.
  - Each hex is clickable (for manual placement).
  - Shows X markers on blocked edges.
  - Responsive: uses `viewBox` so the SVG scales naturally.

- **`src/components/WeatherEffect/WeatherEffect.tsx`** + `.module.css` — Displays the current weather name and full rules text.

### SVG Hex Rendering Approach

Each hex is a flat-top or pointy-top regular hexagon rendered as an SVG `<polygon>`. Key calculations:

- Hex center position derived from `(row, col)` using standard offset-coordinate formulas.
- Hex `points` attribute computed from center + radius.
- Weather type determines fill color (using CSS custom properties for consistency with the app's dark theme).
- The marker is an additional SVG element (e.g., glowing border, pulsing dot) overlaid on the active hex.

Color mapping for weather types (using existing palette where possible):
| Weather | Fill approach |
|---------|--------------|
| Still | Transparent / minimal fill |
| Hazy | Light pattern or muted fill |
| Dust Storm | Dotted pattern |
| Sand Storm | Dark solid fill |
| Heatwave | Vertical stripes |
| Worm-pollen | Marble-like / distinct fill |
| Rain | Swirl pattern / distinct fill |
| Prismatic Tempest | Wavy pattern / distinct fill |

Exact colors/patterns will be determined during implementation to match the dark theme.

---

## 3. Impact and Risk Analysis

- **System Dependencies:** None. This feature is fully independent — no changes to existing table-rolling code, stores, or components.
- **Bundle size:** The hex grid data and SVG rendering add a small amount to the bundle. The grid is ~50 hexes — negligible.
- **Risk — Hex transcription accuracy:** The grid must be manually transcribed from the book's image. If any hex has the wrong weather type or wrong position, the simulation will be wrong. **Mitigation:** Careful transcription with visual verification against the book. Unit tests can validate grid structure (all hexes reachable, correct count, etc.).
- **Risk — Wrap-around edge cases:** The irregular grid shape and X-blocked edges make wrap-around logic non-trivial. **Mitigation:** Comprehensive unit tests for every edge hex and direction, including X-blocked boundaries.
- **Risk — SVG performance on mobile:** Unlikely to be an issue with ~50 hexes, but worth testing on a phone/tablet.

---

## 4. Testing Strategy

- **Unit tests for movement logic** (`src/lib/__tests__/weatherMovement.test.ts`):
  - Basic movement in all 6 directions from the center hex.
  - Wrap-around: moving off a non-X edge wraps to opposite side.
  - X-boundary blocking: moving into an X edge keeps the marker in place.
  - Edge cases: corners, hexes adjacent to multiple X edges.
- **Unit tests for grid data** (`src/lib/__tests__/weatherGrid.test.ts`):
  - Every hex has a valid weather type.
  - Start hex exists in the grid.
  - Grid cell count matches expected total.
- **Component smoke test:** Render `HexGrid` and verify it produces SVG elements, responds to clicks.
- **Manual verification:** Visually compare the rendered grid against the book's hex chart to confirm accuracy.
