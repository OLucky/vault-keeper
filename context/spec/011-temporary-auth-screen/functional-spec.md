# Functional Specification: Temporary Auth Screen

- **Roadmap Item:** Protect app content behind a simple static password gate
- **Status:** Completed
- **Author:** AI-assisted

---

## 1. Overview and Rationale (The "Why")

Vault Keeper contains digitized content from the Vaults of Vaarn sourcebooks. This content is not intended to be publicly accessible. To prevent unauthorized access, the app needs a simple password gate that blocks all content until a correct static password is entered.

This is a **temporary** solution — not a full authentication system. It serves as a lightweight content protection layer, ensuring that only people who have been given the password can view and use the app. The password is defined as an environment variable at build/deploy time, keeping it out of the source code.

**Success looks like:** A visitor who doesn't know the password cannot see any app content. A visitor who enters the correct password gets full access for the duration of their browser session.

---

## 2. Functional Requirements (The "What")

- **Auth gate blocks all content:** When a user visits Vault Keeper without having previously authenticated in their current browser session, they see only the auth screen. No app content (categories, tables, results, etc.) is visible or accessible.
  - **Acceptance Criteria:**
    - [x] A first-time visitor sees only the auth screen — no app navigation, content, or routes are accessible.
    - [x] Directly navigating to any app route (e.g., a category page) redirects to the auth screen if not authenticated.

- **Password input:** The auth screen displays a single password input field and a submit button.
  - **Acceptance Criteria:**
    - [x] The screen shows a password input field (masked characters) and a "Enter" / "Unlock" button.
    - [x] The user can submit the password by clicking the button or pressing the Enter key.

- **Correct password grants access:** When the user enters the correct password (matching the environment variable), they are taken to the app's main screen.
  - **Acceptance Criteria:**
    - [x] Entering the correct password navigates the user to the app's home/category list screen.
    - [x] The authenticated state persists for the browser session (survives page refreshes, but not closing the browser/tab).

- **Incorrect password shows an error:** When the user enters the wrong password, they see an inline error message and can try again.
  - **Acceptance Criteria:**
    - [x] An error message (e.g., "Incorrect password. Try again.") appears below the input field.
    - [x] The input field is cleared or remains editable so the user can immediately retry.
    - [x] There is no limit on retry attempts.

- **Themed auth screen:** The auth screen uses Vault Keeper's existing visual style (colors, fonts, Vaarn aesthetic) so it feels like part of the app.
  - **Acceptance Criteria:**
    - [x] The auth screen uses the same color scheme, fonts, and general aesthetic as the rest of the app.
    - [x] The app name/logo or a recognizable Vaarn-themed element is visible on the screen.

- **Password defined via environment variable:** The static password is configured through an environment variable at build time, not hardcoded in the source code.
  - **Acceptance Criteria:**
    - [x] The password value is read from an environment variable (e.g., `VITE_APP_PASSWORD` or similar).
    - [x] If the environment variable is not set, the auth gate is disabled and the app is fully open (useful for local development).

---

## 3. Scope and Boundaries

### In-Scope

- A single auth screen with password input
- Client-side password validation against a build-time environment variable
- Session-based persistence of authenticated state (sessionStorage or equivalent)
- Themed UI consistent with the existing app
- Blocking all app routes until authenticated
- Graceful fallback: no auth gate when the environment variable is unset

### Out-of-Scope

- User accounts, registration, or per-user passwords (Product Definition non-goal)
- Server-side authentication or API-based validation
- Rate limiting or brute-force protection
- "Remember me" / persistent login across browser sessions
- Password change UI or admin panel
- All other roadmap items: Category-Based Table Browsing, One-Click Rolling, JSON-Driven Table Data, Session Log, Save Individual Results, Quality of Life improvements
