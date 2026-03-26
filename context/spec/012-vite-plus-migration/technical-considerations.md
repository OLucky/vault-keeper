# Technical Specification: Migrate to Vite+

- **Functional Specification:** `context/spec/012-vite-plus-migration/functional-spec.md`
- **Status:** Draft
- **Author(s):** AI-assisted

---

## 1. High-Level Technical Approach

The migration replaces five standalone tools (Vite, Vitest, ESLint, TypeScript CLI, npm) with the unified Vite+ toolchain (`vp`). The approach is:

1. **Prerequisite upgrades** — Bump `vite` to ^8.0.0 and `vitest` to ^4.1.0 in `package.json`, install, and verify the app still builds and tests pass.
2. **Automated migration** — Run `vp migrate --no-interactive` from the workspace root. This handles the bulk of config rewriting and import transformations.
3. **Manual verification & cleanup** — Confirm import rewrites, investigate third-party plugin compatibility, remove old dependencies, consolidate `eslint.config.js` rules into `vite.config.ts`, and update CI.

No application code logic changes. Only tooling configuration, imports, and CI workflow are affected.

---

## 2. Proposed Solution & Implementation Plan (The "How")

### 2.1 Prerequisite Version Upgrades

**Files changed:** `package.json`

- Upgrade `vite` from `^7.3.1` to `^8.0.0`
- Upgrade `vitest` from `^4.0.18` to `^4.1.0`
- Run install, then verify: dev server starts, build produces `dist/`, all tests pass
- Check for any breaking changes in Vite 8 or Vitest 4.1 release notes that affect the current config (especially the `/// <reference types="vitest" />` directive and `defineConfig` import from `vitest/config`)

### 2.2 Run `vp migrate --no-interactive`

Run from workspace root. Document the migration tool's output — what it changed, what it skipped, and any warnings or errors.

### 2.3 Import Rewrites

**Files affected (19 test files + config):**

| Current import                     | Expected rewrite                          | File count                               |
| ---------------------------------- | ----------------------------------------- | ---------------------------------------- |
| `from 'vitest'`                    | `from 'vite-plus/test'`                   | 19 test files (`src/**/*.test.{ts,tsx}`) |
| `from 'vitest/config'`             | `from 'vite-plus/config'` (or equivalent) | 1 (`vite.config.ts`)                     |
| `/// <reference types="vitest" />` | Remove or update to Vite+ equivalent      | 1 (`vite.config.ts`)                     |

After the automated migration, run a grep for `from 'vite'` and `from 'vitest'` across all project-owned `.ts`/`.tsx` files to confirm no residual imports remain.

### 2.4 Third-Party Plugin Compatibility

These plugins use Vite-specific import paths that may or may not be compatible with Vite+:

| Plugin                    | Current import                                                      | Action                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `@vitejs/plugin-react`    | `import react from '@vitejs/plugin-react'`                          | Check if Vite+ bundles its own React plugin or if this import path still works. If replaced, update to Vite+ equivalent. |
| `@tanstack/router-plugin` | `import { TanStackRouterVite } from '@tanstack/router-plugin/vite'` | Check if the `/vite` export path works with Vite+. If not, check for a `/vite-plus` export or alternative.               |

Run `vp help` post-migration to check plugin guidance. Document findings and resolve before completing.

### 2.5 TypeScript Configuration Updates

**Files affected:** `tsconfig.app.json`, `tsconfig.node.json`

| File                 | Current reference               | Expected change                                                                     |
| -------------------- | ------------------------------- | ----------------------------------------------------------------------------------- |
| `tsconfig.app.json`  | `"types": ["vite/client"]`      | Update to `"vite-plus/client"` or equivalent if Vite+ provides its own client types |
| `tsconfig.node.json` | `"include": ["vite.config.ts"]` | No change expected (file name stays the same)                                       |

### 2.6 Dependency Removal

**After confirming all imports are rewritten and working:**

Remove from `devDependencies`:

- `vite`
- `vitest`
- `eslint`
- `@eslint/js`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `typescript-eslint`
- `globals`
- `@vitejs/plugin-react` (only if Vite+ provides its own React plugin)

Delete file: `eslint.config.js`

### 2.7 Config Consolidation into `vite.config.ts`

Current `eslint.config.js` rules to migrate into the `lint` block of `vite.config.ts`:

| ESLint rule set                        | Vite+ lint block equivalent                        |
| -------------------------------------- | -------------------------------------------------- |
| `js.configs.recommended`               | Built-in JS recommended rules                      |
| `tseslint.configs.recommended`         | Built-in TS recommended rules                      |
| `reactHooks.configs.flat.recommended`  | React Hooks rules (check Vite+ built-in support)   |
| `reactRefresh.configs.vite`            | React Refresh rules (check Vite+ built-in support) |
| `globals.browser`                      | Browser globals                                    |
| Ignored: `dist`, `**/routeTree.gen.ts` | Ignore patterns in lint config                     |

Test config (`globals`, `environment`, `setupFiles`, `passWithNoTests`) should remain in the `test` block. The `base: '/vault-keeper/'` setting and plugin array stay at the top level.

### 2.8 Update `package.json` Scripts

| Current script                    | New script                                                 |
| --------------------------------- | ---------------------------------------------------------- |
| `"dev": "vite"`                   | `"dev": "vp dev"` (or remove if `vp dev` is used directly) |
| `"build": "vite build && tsc -b"` | `"build": "vp build"` (Vite+ handles type-checking)        |
| `"lint": "eslint ."`              | `"lint": "vp lint"` (or remove)                            |
| `"preview": "vite preview"`       | `"preview": "vp preview"` (or remove)                      |
| `"test": "vitest run"`            | `"test": "vp test"` (or remove)                            |

### 2.9 CI Workflow Update

**File:** `.github/workflows/deploy.yml`

| Step           | Current                          | New                                                                                           |
| -------------- | -------------------------------- | --------------------------------------------------------------------------------------------- |
| Set up Node.js | `node-version: 20`, `cache: npm` | Update Node version if Vite+ requires newer; update cache strategy if package manager changes |
| Install        | `npm ci`                         | `vp install`                                                                                  |
| Build          | `npm run build`                  | `vp build`                                                                                    |
| Env var        | `VITE_APP_PASSWORD`              | Keep as-is (same prefix convention assumed)                                                   |

If Vite+ changes the package manager (per functional spec: "let Vite+ decide"), the `cache` key in `actions/setup-node` needs to match the new manager, and the Vite+ CLI itself needs to be available in CI (may need global install or npx-equivalent step).

---

## 3. Impact and Risk Analysis

### System Dependencies

- **GitHub Pages deployment** — The build output must still land in `dist/` with `base: '/vault-keeper/'`. Verify after migration.
- **`VITE_APP_PASSWORD` secret** — Used in CI and referenced at runtime via `import.meta.env`. Must continue working with Vite+.
- **TanStack Router code generation** — The router plugin generates `routeTree.gen.ts`. Verify this still works post-migration.

### Potential Risks & Mitigations

| Risk                                                                                                | Likelihood | Mitigation                                                                                                     |
| --------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| Third-party plugins (`@vitejs/plugin-react`, `@tanstack/router-plugin`) are incompatible with Vite+ | Medium     | Investigate during migration (Step 2.4). Fall back to Vite+ equivalents or compatibility shims if needed.      |
| `vp migrate` misses some imports or config                                                          | Low        | Manual grep for residual `vite`/`vitest` imports after migration. Run `vp check` to catch type or lint errors. |
| Package manager switch breaks CI cache or lockfile                                                  | Medium     | After migration, update `deploy.yml` cache strategy to match the new manager. Test CI end-to-end.              |
| `routeTree.gen.ts` generation breaks                                                                | Low        | Run `vp dev` and verify routes work. The generated file is git-ignored and regenerated on build.               |

---

## 4. Testing Strategy

- **Pre-migration baseline:** Run `vp test` (or `vitest run`) before starting to establish a passing baseline. Record test count.
- **Post-migration regression:** Run `vp test` after migration. All tests must pass with the same count — zero regressions.
- **Build verification:** Run `vp build` and confirm `dist/` output structure matches pre-migration (HTML, JS, CSS, JSON assets, correct `base` path).
- **Lint verification:** Run `vp lint` and confirm it catches the same class of errors as the old ESLint config (no new false positives, no missed violations).
- **Full validation:** Run `vp check` as the single verification command covering lint + types + tests.
- **CI smoke test:** Push to a branch and verify the updated GitHub Actions workflow succeeds end-to-end.
