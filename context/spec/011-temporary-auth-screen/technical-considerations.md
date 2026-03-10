# Technical Specification: Temporary Auth Screen

- **Functional Specification:** `context/spec/011-temporary-auth-screen/functional-spec.md`
- **Status:** Completed
- **Author(s):** AI-assisted

---

## 1. High-Level Technical Approach

The auth screen is implemented as a **root layout gate** in `__root.tsx`. When a user is not authenticated and a password is configured via environment variable, the root layout renders an `AuthScreen` component instead of the normal app layout. This blocks all routes without needing per-route redirect logic.

Auth state is managed by a new Zustand store using `sessionStorage` persistence — surviving page refreshes but clearing when the browser tab is closed. The password is injected at build time via `VITE_APP_PASSWORD` and compared client-side. If the env var is unset, the auth gate is disabled entirely.

---

## 2. Proposed Solution & Implementation Plan

### Environment Variable

| Variable | Purpose |
|---|---|
| `VITE_APP_PASSWORD` | Static password for the auth gate. If empty/unset, auth is disabled. |

- Access in code: `import.meta.env.VITE_APP_PASSWORD`
- For local dev: add to `.env.local` (gitignored) or leave unset to skip auth
- For production: inject as a GitHub Actions secret in the deploy workflow

### GitHub Actions Change

In `.github/workflows/deploy.yml`, add the env var to the build step:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_APP_PASSWORD: ${{ secrets.VITE_APP_PASSWORD }}
```

### Auth Store

- **File:** `src/stores/authStore.ts`
- **Storage key:** `vault-keeper-auth`
- **Storage type:** `sessionStorage` (not `localStorage`)
- **State shape:**

| Field | Type | Purpose |
|---|---|---|
| `isAuthenticated` | `boolean` | Whether the user has entered the correct password |
| `authenticate` | `(password: string) => boolean` | Validates password, sets `isAuthenticated` to `true` on match, returns success |

- `authenticate` compares input against `import.meta.env.VITE_APP_PASSWORD`
- `partialize`: persist only `isAuthenticated`

### Root Layout Gate (`__root.tsx`)

The existing `RootLayout` component gains a conditional check:

1. Read `isAuthenticated` from the auth store
2. Check if `VITE_APP_PASSWORD` is set (non-empty)
3. If password is set AND user is not authenticated → render `<AuthScreen />`
4. Otherwise → render the normal app layout (existing behavior)

### AuthScreen Component

- **Directory:** `src/components/AuthScreen/`
- **Files:** `AuthScreen.tsx`, `AuthScreen.module.css`
- **UI elements:**
  - App name/logo or Vaarn-themed heading
  - Password input field (React Aria `TextField` + `Input`, type `password`)
  - "Unlock" submit button (React Aria `Button`)
  - Inline error message area (shown on incorrect password)
- **Behavior:**
  - Submit via button click or Enter key
  - On submit: call `authStore.authenticate(password)`
  - If returns `false`: display "Incorrect password. Try again." below input
  - If returns `true`: component unmounts as root layout now renders the app
- **Styling:** Uses existing design tokens (`--color-*`, `--space-*`, `--font-*`, `--radius-*`). Centered layout, dark theme consistent with the app.

### Vite TypeScript Env Declaration

Add type declaration for the new env var in `src/vite-env.d.ts` (or create if missing):

```typescript
interface ImportMetaEnv {
  readonly VITE_APP_PASSWORD: string
}
```

---

## 3. Impact and Risk Analysis

**System Dependencies:**
- `__root.tsx` is modified — this affects all routes, but the change is a simple conditional wrapper
- No changes to existing stores, components, or routes

**Potential Risks & Mitigations:**

| Risk | Mitigation |
|---|---|
| Password is embedded in the JS bundle and visible to anyone who inspects the source | This is a known limitation of client-side auth. Acceptable for temporary content protection — not a substitute for server-side security. |
| Auth gate accidentally blocks app when env var is misconfigured | Default behavior when env var is unset is "no gate" — safe fallback. Only a non-empty `VITE_APP_PASSWORD` activates the gate. |
| `sessionStorage` may behave differently across browsers for "session" lifetime | All modern browsers clear `sessionStorage` on tab close. This is well-standardized behavior. |

---

## 4. Testing Strategy

- **Store unit tests** (`src/stores/__tests__/authStore.test.ts`):
  - `authenticate` returns `true` and sets `isAuthenticated` when password matches
  - `authenticate` returns `false` and keeps `isAuthenticated` as `false` when password is wrong
  - Auth gate is disabled when env var is empty/undefined

- **Component tests** (`src/components/__tests__/AuthScreen.test.tsx`):
  - Renders password input and submit button
  - Shows error message on incorrect password submission
  - Calls `authenticate` on form submit (button click and Enter key)

- **Integration/manual testing:**
  - With `VITE_APP_PASSWORD` set: verify all routes are blocked, correct password grants access, auth survives refresh, auth clears on tab close
  - Without `VITE_APP_PASSWORD`: verify app loads normally with no auth gate
