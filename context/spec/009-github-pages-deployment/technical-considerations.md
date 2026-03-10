# Technical Specification: GitHub Pages Deployment

- **Functional Specification:** `context/spec/009-github-pages-deployment/functional-spec.md`
- **Status:** Draft
- **Author(s):** Claude

---

## 1. High-Level Technical Approach

Two minimal changes deploy Vault Keeper to GitHub Pages:

1. **Vite config** — Set `base: '/vault-keeper/'` so all asset URLs resolve correctly under the GitHub Pages subpath.
2. **GitHub Actions workflow** — A single workflow file that builds the app and deploys the `dist/` folder to GitHub Pages on every push to `master`.

No application code changes are needed. The app already fetches table JSON from relative paths, which Vite's `base` config handles automatically.

---

## 2. Proposed Solution & Implementation Plan (The "How")

### Vite Configuration Change

- **File:** `vite.config.ts`
- **Change:** Add `base: '/vault-keeper/'` to the `defineConfig` object.
- This ensures all generated asset URLs (JS chunks, CSS, and the `/public` directory JSON files) are prefixed with `/vault-keeper/` in the production build.
- The TanStack Router file-based routing already uses relative paths, so no router-level `basePath` change is expected to be needed.

### GitHub Actions Workflow

- **File:** `.github/workflows/deploy.yml`
- **Trigger:** `push` to `master` branch
- **Runner:** `ubuntu-latest`
- **Node version:** 20 (LTS)
- **Steps:**
  1. Checkout code
  2. Setup Node.js 20 with npm cache
  3. `npm ci` — install dependencies
  4. `npm run build` — produces `dist/` folder
  5. Upload `dist/` as a Pages artifact using `actions/upload-pages-artifact`
  6. Deploy using `actions/deploy-pages`
- **Permissions:** The workflow needs `pages: write` and `id-token: write` permissions for the OIDC-based Pages deployment.
- **Environment:** Uses the `github-pages` environment (created automatically by GitHub).

### GitHub Repository Settings

- GitHub Pages must be configured to deploy from **GitHub Actions** (not from a branch). This is a one-time manual setting in the repo's Settings > Pages section.

---

## 3. Impact and Risk Analysis

- **System Dependencies:** No impact on application code. The `base` config only affects the build output's URL prefixing.
- **Table data paths:** The app fetches JSON from paths like `/tables/manifest.json`. With `base: '/vault-keeper/'`, Vite rewrites these to `/vault-keeper/tables/manifest.json` in production. Verify that table data fetches use Vite-resolved paths (not hardcoded absolute paths).
- **Potential Risk — Hardcoded paths:** If any fetch calls use absolute paths starting with `/`, they will break under the subpath. **Mitigation:** Review fetch calls to ensure they use `import.meta.env.BASE_URL` or relative paths.
- **Potential Risk — TanStack Router base path:** The router may need a `basePath` config if links don't resolve correctly. **Mitigation:** Test navigation after deployment; add `basePath` to router config if needed.

---

## 4. Testing Strategy

- **Build verification:** Run `npm run build` locally and inspect the generated `dist/index.html` to confirm asset paths include `/vault-keeper/`.
- **Local preview:** Run `npx vite preview` and verify the app loads correctly at `http://localhost:4173/vault-keeper/`.
- **Post-deployment smoke test:** After the first GitHub Actions deploy, manually verify:
  - App loads at `olucky.github.io/vault-keeper/`
  - Table data loads (roll on a table set)
  - Navigation between pages works
  - Assets (CSS, fonts) load without 404s
