# Functional Specification: Migrate to Vite+

- **Roadmap Item:** Developer tooling consolidation — not a user-facing feature
- **Status:** Completed
- **Author:** AI-assisted

---

## 1. Overview and Rationale (The "Why")

Vault Keeper's development workflow currently relies on multiple standalone tools configured and maintained separately: **Vite 7.3.1** (dev server & build), **Vitest 4.0.18** (testing), **ESLint 9** (linting), **TypeScript 5.9** (type-checking), and **pnpm** (package management). Each has its own config file and CLI.

**Vite+** is a unified toolchain that replaces this split setup with a single tool (`vp`) and a single config surface (`vite.config.ts`). Migrating to Vite+ will:

- **Reduce configuration sprawl:** One config file instead of `vite.config.ts` + `eslint.config.js` + separate TypeScript/test configs.
- **Simplify the command surface:** `vp dev`, `vp build`, `vp test`, `vp lint`, `vp fmt`, `vp check` replace multiple CLI tools.
- **Lower onboarding friction:** A single tool to learn instead of five.

**Success criteria:** After migration, all development commands (`dev`, `build`, `test`, `lint`, `check`) work through `vp` with zero regressions in build output or test results.

---

## 2. Functional Requirements (The "What")

### 2.1 Prerequisites — Upgrade to Vite 8+ and Vitest 4.1+

Before running the migration, the project must be on compatible versions.

- **Acceptance Criteria:**
  - [x]`vite` dependency is upgraded to ^8.0.0 or higher.
  - [x]`vitest` dependency is upgraded to ^4.1.0 or higher.
  - [x]`vp dev`, `vp build`, and `vp test` work correctly with the upgraded versions before proceeding.

### 2.2 Run the Automated Migration

Use `vp migrate --no-interactive` in the workspace root.

- **Acceptance Criteria:**
  - [x]The migration command completes without fatal errors.
  - [x]Any issues the automated migration cannot resolve are documented and fixed manually before the migration is considered complete.

### 2.3 Rewrite Imports

Confirm that all source-code and config imports are updated.

- **Acceptance Criteria:**
  - [x]All `vite` imports in application and config code are rewritten to `vite-plus` where needed.
  - [x]All `vitest` imports (including in `vite.config.ts` and test files) are rewritten to `vite-plus/test` where needed.
  - [x]No residual `from 'vite'` or `from 'vitest'` imports remain in project-owned files (excluding `node_modules`).

### 2.4 Remove Old Dependencies

Only after import rewrites are confirmed.

- **Acceptance Criteria:**
  - [x]The `vite` package is removed from `devDependencies`.
  - [x]The `vitest` package is removed from `devDependencies`.
  - [x]Standalone ESLint packages (`eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `typescript-eslint`, `globals`) are removed from `devDependencies`.
  - [x]The standalone `eslint.config.js` file is deleted.
  - [x]No Prettier config files exist in the project root (none currently present — confirmed).

### 2.5 Consolidate Config into `vite.config.ts`

Move all remaining tool-specific configuration into the appropriate blocks.

- **Acceptance Criteria:**
  - [x]Lint rules (currently in `eslint.config.js`: recommended JS, recommended TS, React Hooks, React Refresh, browser globals, ignored paths) are represented in the `lint` block of `vite.config.ts`.
  - [x]Formatting config (if any) is represented in the `fmt` block of `vite.config.ts`.
  - [x]Test config (`globals: true`, `environment: 'jsdom'`, `setupFiles`, `passWithNoTests`) remains in the `test` block of `vite.config.ts`.
  - [x]The `base: '/vault-keeper/'` setting is preserved.
  - [x]The TanStack Router and React plugins remain configured.

### 2.6 Package Manager Handling

Vite+ delegates package management through the `packageManager` field. The migration may change the declared package manager.

- **Acceptance Criteria:**
  - [x]If Vite+ recommends or defaults to a different package manager, the switch is accepted.
  - [x]`vp install` resolves all dependencies successfully after migration.

### 2.7 Command Mapping Verification

All prior development commands must work through `vp`.

- **Acceptance Criteria:**
  - [x]`vp dev` starts the dev server (replaces `pnpm run dev` / `vite`).
  - [x]`vp build` produces the production build (replaces `vite build && tsc -b`).
  - [x]`vp test` runs the test suite and all tests pass (replaces `vitest run`).
  - [x]`vp lint` checks for lint errors (replaces `eslint .`).
  - [x]`vp check` runs the full validation suite (lint + types + tests).
  - [x]`vp preview` serves the production build locally.

### 2.8 Final Verification

- **Acceptance Criteria:**
  - [x]`vp install` — completes without errors.
  - [x]`vp check` — passes (lint, types, tests).
  - [x]`vp test` — all existing tests pass with no regressions.
  - [x]`vp build` — produces output in `dist/` with `base: '/vault-keeper/'` intact.
  - [x]A summary of the migration is produced, listing any manual follow-up still required.

---

## 3. Scope and Boundaries

### In-Scope

- Upgrading Vite and Vitest to meet migration prerequisites.
- Running `vp migrate --no-interactive` and resolving any issues it produces.
- Rewriting imports (`vite` → `vite-plus`, `vitest` → `vite-plus/test`).
- Removing old standalone dependencies (Vite, Vitest, ESLint and its plugins).
- Deleting `eslint.config.js` and consolidating its rules into `vite.config.ts`.
- Updating `package.json` scripts to use `vp` commands.
- Allowing Vite+ to change the declared package manager if it recommends one.
- Manually fixing any issues the automated migration cannot resolve.

### Out-of-Scope

- All other roadmap items (Quality of Life, Session Log, etc.) — these are separate specs.
- Adding new lint rules or formatting opinions beyond what currently exists.
- Changing application code behavior — this is a tooling-only migration.
- CI/CD pipeline updates (GitHub Actions workflows) — can be addressed as follow-up if needed.
- Upgrading application dependencies (React, TanStack, etc.) beyond what the migration requires.
