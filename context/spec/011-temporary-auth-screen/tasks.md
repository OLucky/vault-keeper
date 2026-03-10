# Tasks: Temporary Auth Screen

_Spec: `context/spec/011-temporary-auth-screen`_

---

- [x] **Slice 1: Auth store with sessionStorage persistence**
  - [x] Add TypeScript env declaration for `VITE_APP_PASSWORD` in `src/vite-env.d.ts` **[Agent: react-frontend]**
  - [x] Create `src/stores/authStore.ts` — Zustand store with `isAuthenticated` state and `authenticate(password)` action, using `persist` middleware with `sessionStorage`. Compare input against `import.meta.env.VITE_APP_PASSWORD`. **[Agent: react-frontend]**
  - [x] Write unit tests in `src/stores/__tests__/authStore.test.ts` — verify correct/incorrect password behavior and disabled gate when env var is unset. **[Agent: test-agent]**
  - [x] **Verify:** Run `npm test` — all auth store tests pass. **[Agent: test-agent]**

- [x] **Slice 2: AuthScreen component (themed, functional)**
  - [x] Create `src/components/AuthScreen/AuthScreen.tsx` and `AuthScreen.module.css` — password input (React Aria `TextField`, type `password`), "Unlock" button (React Aria `Button`), inline error message on wrong password, Vaarn-themed styling using existing design tokens (centered layout, dark theme). Submit on button click and Enter key. **[Agent: react-frontend]**
  - [x] Write component tests in `src/components/__tests__/AuthScreen.test.tsx` — renders input and button, shows error on wrong password, calls `authenticate` on submit (click and Enter). **[Agent: test-agent]**
  - [x] **Verify:** Run `npm test` — all AuthScreen component tests pass. **[Agent: test-agent]**

- [x] **Slice 3: Root layout gate + end-to-end wiring**
  - [x] Modify `src/routes/__root.tsx` — read `isAuthenticated` from auth store; if `VITE_APP_PASSWORD` is set and user is not authenticated, render `<AuthScreen />` instead of the normal app layout. When env var is unset/empty, skip the gate entirely. **[Agent: react-frontend]**
  - [x] **Verify (manual):** Run `VITE_APP_PASSWORD=test npm run dev` and open in browser. Confirm: auth screen blocks all routes; wrong password shows inline error; correct password grants access to the app; page refresh preserves auth; without env var, app loads normally with no gate. **[Agent: test-agent]**

- [x] **Slice 4: GitHub Actions deployment integration**
  - [x] Add `VITE_APP_PASSWORD: ${{ secrets.VITE_APP_PASSWORD }}` env var to the build step in `.github/workflows/deploy.yml`. **[Agent: github-infra]**
  - [x] **Verify:** Validate workflow YAML syntax is correct. **[Agent: github-infra]**
