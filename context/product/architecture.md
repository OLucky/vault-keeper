# System Architecture Overview: Vault Keeper

_Vault Keeper is a fully client-side web application with no backend server. All data is either bundled as static JSON files or persisted in the browser's local storage._

---

## 1. Application & Technology Stack

- **Build Tool:** Vite
- **Language:** TypeScript
- **UI Framework:** React
- **Routing:** TanStack Router (file-based, type-safe routing)
- **State Management:** Zustand (session log, saved results, app state)
- **Component Library:** React Aria Components (accessible, unstyled primitives)
- **Styling:** CSS Modules with modern CSS features (nesting, custom properties, container queries)

---

## 2. Data & Persistence

- **Table Data (Static):** JSON files served from the `/public` directory, fetched at runtime on demand. This allows adding or editing tables without rebuilding the app.
- **Session Log (Persistent):** Persisted to browser `localStorage` using Zustand's `persist` middleware. Entries survive page refreshes and tab closures; only cleared when the user explicitly clears the log.
- **Saved Results (Persistent, Phase 2):** Persisted to browser `localStorage` using Zustand's `persist` middleware. Individual results are saved/removed by the user.

---

## 3. Infrastructure & Deployment

- **Hosting:** GitHub Pages (free static site hosting, deployed from git).
- **Build Output:** Vite produces a static `/dist` folder with HTML, JS, CSS, and JSON assets.
- **CI/CD:** GitHub Actions workflow to build and deploy on push to the main branch.
- **No backend, no server, no database** — the entire app runs in the browser.
