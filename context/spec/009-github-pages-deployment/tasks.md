# Tasks: GitHub Pages Deployment

- [x] **Slice 1: Vite base path and local build verification**
  - [x] Add `base: '/vault-keeper/'` to `vite.config.ts` **[Agent: general-purpose]**
  - [x] Review all fetch calls in the codebase for hardcoded absolute paths (e.g., `/tables/...`). Update any that don't use `import.meta.env.BASE_URL` to ensure they resolve correctly under the subpath. **[Agent: general-purpose]**
  - [x] Run `npm run build` and verify that `dist/index.html` asset paths include `/vault-keeper/` prefix. **[Agent: general-purpose]**
  - [x] Run `npx vite preview` and verify the app loads at `http://localhost:4173/vault-keeper/`, table data loads, and navigation works. **[Agent: general-purpose]**

- [x] **Slice 2: GitHub Actions deploy workflow and live deployment**
  - [x] Create `.github/workflows/deploy.yml` with: trigger on push to `master`, Node 20, `npm ci`, `npm run build`, `actions/upload-pages-artifact` for `dist/`, `actions/deploy-pages`, and required permissions (`pages: write`, `id-token: write`). **[Agent: general-purpose]**
  - [x] **Manual step (user):** In GitHub repo Settings > Pages, set source to "GitHub Actions" instead of "Deploy from a branch".
  - [x] Push changes to `master` and verify the GitHub Actions workflow runs successfully. **[Agent: general-purpose]**
  - [x] Verify the live site loads at `olucky.github.io/vault-keeper/` — app renders, table rolls work, navigation works, no 404s on assets. **[Agent: general-purpose]**
