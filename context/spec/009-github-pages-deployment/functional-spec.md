# Functional Specification: GitHub Pages Deployment

- **Roadmap Item:** Quality of Life — GitHub Pages config
- **Status:** Draft
- **Author:** Claude

---

## 1. Overview and Rationale (The "Why")

Vault Keeper is designed to be a browser-based tool accessible without installation. Currently, the app can only be run locally via a development server. This means the GM must have a development environment set up — defeating the purpose of a quick, always-available tool at the game table.

By deploying to GitHub Pages, Vault Keeper becomes accessible at a stable URL (`olucky.github.io/vault-keeper`) from any device with a browser — laptop, tablet, or phone — with zero setup. Every push to `master` automatically builds and deploys the latest version, ensuring the live app always reflects the most recent table data and features.

**Success criteria:** The app is live at the GitHub Pages URL, loads correctly, and updates automatically when changes are pushed to `master`.

---

## 2. Functional Requirements (The "What")

- **The app must be publicly accessible at `olucky.github.io/vault-keeper`.**
  - **Acceptance Criteria:**
    - [ ] Visiting the URL in a browser loads the Vault Keeper app.
    - [ ] All pages, assets, and table data load correctly under the `/vault-keeper/` subpath.

- **The app must be automatically built and deployed when changes are pushed to `master`.**
  - **Acceptance Criteria:**
    - [ ] A push to the `master` branch triggers an automated build-and-deploy pipeline.
    - [ ] After a successful pipeline run, the live site reflects the pushed changes.
    - [ ] If the build fails, the existing live site remains unchanged.

- **The Vite build must be configured for the GitHub Pages subpath.**
  - **Acceptance Criteria:**
    - [ ] The app's `base` path is set so that all asset URLs (JS, CSS, JSON table data) resolve correctly when served from `/vault-keeper/`.
    - [ ] Client-side routing (if any) works correctly under the subpath.

---

## 3. Scope and Boundaries

### In-Scope

- GitHub Actions workflow file for automated build and deploy to GitHub Pages
- Vite `base` path configuration for the `/vault-keeper/` subpath
- Deployment triggered on every push to `master`

### Out-of-Scope

- Custom domain configuration
- Manual deployment trigger / workflow dispatch
- Preview deployments for pull requests
- Any other Phase 3 Quality of Life items (handled in separate specs)
