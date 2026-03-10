# Tasks: Vaarn Weather Simulator

- [x] **Slice 1: Hex grid data model and movement engine with tests**
  - [x] Create `src/lib/weatherGrid.ts` with `WeatherType` enum, `HexCell` type, `GRID_CELLS` array (transcribed from the book's hex map), `START_HEX`, `BLOCKED_EDGES`, and `WEATHER_EFFECTS` (full rules text for all 8 weather types). **[Agent: general-purpose]**
  - [x] Create `src/lib/weatherMovement.ts` with `getNeighbor`, `resolveMove`, and `getWrappedHex` pure functions implementing d6 direction mapping, X-boundary blocking, and edge wrapping. **[Agent: general-purpose]**
  - [x] Create `src/lib/__tests__/weatherGrid.test.ts` — validate grid structure: every hex has a valid weather type, start hex exists, cell count matches expected total, no duplicate coordinates. **[Agent: general-purpose]**
  - [x] Create `src/lib/__tests__/weatherMovement.test.ts` — test movement in all 6 directions from center, wrap-around on non-X edges, X-boundary blocking (marker stays put), and corner/edge cases. **[Agent: general-purpose]**
  - [x] Run `npm test` and verify all new tests pass. **[Agent: general-purpose]**

- [x] **Slice 2: Weather page with SVG hex grid and marker display**
  - [x] Create `src/components/HexGrid/HexGrid.tsx` + `HexGrid.module.css` — SVG renderer that draws all hex cells as `<polygon>` elements colored by weather type, with a `viewBox` for responsive scaling and a legend. **[Agent: general-purpose]**
  - [x] Create `src/components/WeatherEffect/WeatherEffect.tsx` + `WeatherEffect.module.css` — displays the current weather type name and full rules text. **[Agent: general-purpose]**
  - [x] Create `src/routes/weather.tsx` with a `/weather` route that composes the HexGrid and WeatherEffect components, showing the marker at the Start hex on initial load. **[Agent: general-purpose]**
  - [x] Run `npm run build` to verify the app compiles without errors. **[Agent: general-purpose]**
  - [x] Open the app in a browser, navigate to `/weather`, and visually verify the hex grid renders with correct colors/labels and the marker is on the Start hex. **[Agent: general-purpose]**

- [x] **Slice 3: Day advancement, manual placement, reset, and persistence**
  - [x] Create `src/stores/weatherStore.ts` with Zustand persist middleware — `markerPosition`, `lastRoll` state; `advanceDay()`, `placeMarker(row, col)`, `reset()` actions. Persist only `markerPosition` to local storage as `vault-keeper-weather`. **[Agent: general-purpose]**
  - [x] Wire the store into the Weather page: "Next Day" button calls `advanceDay()` and displays the d6 result and direction; clicking a hex calls `placeMarker()`; "Reset" button calls `reset()`. **[Agent: general-purpose]**
  - [x] Verify in browser: press "Next Day" multiple times — marker moves, d6 result shown, weather effect text updates. Click a hex to manually place the marker. Press "Reset" to return to Start. Refresh the page and confirm the marker position persists. **[Agent: general-purpose]**

- [x] **Slice 4: Dashboard integration and final polish**
  - [x] Add a "Weather" link/card on the dashboard (`src/routes/index.tsx`) that navigates to `/weather`. **[Agent: general-purpose]**
  - [x] Verify in browser: the Weather link is visible on the dashboard, clicking it navigates to the Weather page, and the back link returns to the dashboard. **[Agent: general-purpose]**
  - [x] Visual comparison: compare the rendered hex grid against the book's hex chart image to confirm all hex positions and weather types are accurate. **[Agent: general-purpose]**
