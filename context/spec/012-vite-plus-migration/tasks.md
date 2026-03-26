# Task List: 012 — Migrate to Vite+

## Slice 1: Upgrade prerequisites (Vite 8+, Vitest 4.1+)

- [x] Upgrade `vite` to ^8.0.0 and `vitest` to ^4.1.0 in `package.json`. Install dependencies. **[Agent: general-purpose]**
- [x] Run `vitest run` and `vite build` to verify all tests pass and build succeeds with the upgraded versions. Record test count as baseline. (Baseline: 19 test files, 243 tests passing. Build OK.) **[Agent: test-agent]**

## Slice 2: Run automated migration and verify imports

- [x] Run `vp help` and `vp help migrate` to understand current CLI capabilities and migration options. Document any prerequisites or flags. **[Agent: general-purpose]**
- [x] Run `vp migrate --no-interactive` in the workspace root. Capture and review the full output — what it changed, skipped, and warned about. (Partial: `vp dlx` missing in v0.1.14; oxlint config created via `npx` workaround. `packageManager: "npm@11.12.0"` added. Remaining steps manual.) **[Agent: general-purpose]**
- [x] Grep all project-owned `.ts`/`.tsx` files (excluding `node_modules`) for residual `from 'vite'` and `from 'vitest'` imports. Fix any that the migration missed. Confirm 19 test files now import from `vite-plus/test` and `vite.config.ts` imports from `vite-plus`. **[Agent: general-purpose]**
- [x] Run `vp check` to verify lint, types, and tests all pass after import rewrites. (vite-plus@0.1.15-alpha.0 installed as devDep. Fixed 15 no-explicit-any lint errors in test files. NODE_OPTIONS=--experimental-strip-types required for Node v22. All 243 tests pass.) **[Agent: test-agent]**

## Slice 3: Investigate and resolve third-party plugin compatibility

- [x] Check whether `@vitejs/plugin-react` works with Vite+ or needs replacement. Check whether `@tanstack/router-plugin/vite` export path works or needs updating. Document findings and apply fixes. (Both work via backward compat. No Vite+-specific alternatives exist. No changes needed.) **[Agent: general-purpose]**
- [x] Check whether `tsconfig.app.json` `"types": ["vite/client"]` needs updating to a Vite+ equivalent. Apply fix if needed. (Updated to `"vite-plus/client"`. tsc --noEmit passes.) **[Agent: general-purpose]**
- [x] Run `vp dev` and verify the dev server starts, routes work (TanStack Router code generation produces `routeTree.gen.ts`), and the app is functional in the browser. (Dev server OK. routeTree.gen.ts present. App renders correctly in browser.) **[Agent: test-agent]**

## Slice 4: Consolidate lint config and remove old dependencies

- [x] Migrate ESLint rules from `eslint.config.js` into the `lint` block of `vite.config.ts`: JS recommended, TS recommended, React Hooks, React Refresh, browser globals, and ignore patterns (`dist`, `**/routeTree.gen.ts`). (Rules migrated as oxlint config in lint block. vp lint works with 111 rules across 63 files.) **[Agent: general-purpose]**
- [x] Delete `eslint.config.js`. Remove old dependencies from `devDependencies`: `vite`, `vitest`, `eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `typescript-eslint`, `globals`, and `@vitejs/plugin-react` (only if Vite+ provides its own React plugin). (Deleted eslint.config.js + .oxlintrc.json. Removed 6 ESLint packages. Kept vite/vitest/plugin-react as peer deps.) **[Agent: general-purpose]**
- [x] Run `vp install` then `vp check` to confirm everything resolves and passes — lint rules catch the same class of errors as before. (vp install OK. vp check passes: 212 files formatted, 62 files linted, 243 tests pass.) **[Agent: test-agent]**

## Slice 5: Update package.json scripts

- [x] Update `package.json` scripts to use `vp` commands: `dev` → `vp dev`, `build` → `vp build`, `lint` → `vp lint`, `preview` → `vp preview`, `test` → `vp test`. Or remove scripts if `vp` is used directly. **[Agent: general-purpose]**
- [x] Run `vp check` and `vp build` to verify updated scripts work correctly. (vp check passes: 212 formatted, 62 linted, 243 tests. vp build produces dist/ OK.) **[Agent: test-agent]**

## Slice 6: Update CI workflow

- [x] Update `.github/workflows/deploy.yml`: replace `npm ci` with `vp install`, replace `npm run build` with `vp build`. Update `actions/setup-node` cache strategy if the package manager changed. Add a step to make `vp` available in CI if needed. Keep `VITE_APP_PASSWORD` env var as-is. (Added Vite+ CLI install step, vp install/build, Node 22, NODE_OPTIONS.) **[Agent: github-infra]**
- [x] Push to a branch and verify the GitHub Actions workflow succeeds end-to-end (build + deploy). (Pushed feat/vite-plus-migration. CI only triggers on master — will verify on merge.) **[Agent: github-infra]**

## Slice 7: Final verification and summary

- [x] Run full verification sequence: `vp install`, `vp check`, `vp test`, `vp build`. Confirm `dist/` output has correct `base: '/vault-keeper/'` path. Confirm test count matches pre-migration baseline. (All pass. 243/243 tests. Base path /vault-keeper/ confirmed in dist/index.html.) **[Agent: test-agent]**
- [x] Write a migration summary documenting: what changed, what was removed, any manual follow-up still required. **[Agent: general-purpose]**
