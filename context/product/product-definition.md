# Product Definition: Vault Keeper

- **Version:** 1.0
- **Status:** Proposed

---

## 1. The Big Picture (The "Why")

### 1.1. Project Vision & Purpose

Vault Keeper is a fast, browser-based random generator tool for Vaults of Vaarn gamemasters. It eliminates the need to flip through sourcebooks during sessions by providing instant, one-click rolls on organized sets of random tables — keeping the game flowing and the world feeling alive.

### 1.2. Target Audience

The primary user is a single GM (the creator) running Vaults of Vaarn sessions who needs quick access to random generation tables at the game table. The tool may be shared with other Vaarn GMs in the future, but V1 is built for personal use.

### 1.3. User Personas

- **Persona 1: "The Prep-Light GM"**
  - **Role:** Gamemaster running weekly Vaults of Vaarn sessions.
  - **Goal:** Wants to generate NPCs, items, and locations on the fly during play without breaking immersion or fumbling through PDFs.
  - **Frustration:** Flipping through multiple zine issues to find the right table, then rolling physical dice and cross-referencing results, is slow and pulls attention away from the players.

### 1.4. Success Metrics

- **Table-side adoption:** The tool is actually used during live game sessions, replacing physical book lookups.
- **Extensibility:** Adding a new table set (as a JSON file) is straightforward and takes under 10 minutes.
- **Content coverage:** Over time, all major random tables from the Vaults of Vaarn sourcebooks are digitized and available in the app.

---

## 2. The Product Experience (The "What")

### 2.1. Core Features

- **Category-based table browsing:** Tables are organized into categories (e.g., NPCs, Weapons/Items). The user navigates to a category to see available table sets.
- **One-click rolling:** Each table set has a "Roll" action that instantly generates a randomized result across all tables in the set (e.g., rolling an NPC generates a name, a trait, and a motivation simultaneously).
- **Session log:** Generated results are saved to a running session log that persists during the session and can be exported as text.
- **JSON-driven table data:** All table content is defined in structured JSON files, making it easy to add, edit, or extend tables without touching app code.
- **Sample/placeholder data:** V1 ships with example table data; real Vaults of Vaarn content will be added over time.

### 2.2. User Journey

A GM opens Vault Keeper in their browser before or during a session. They see a list of content categories (NPCs, Weapons/Items). They tap "NPCs" and see the available table sets (e.g., "Vaarn NPC Generator"). They hit "Roll" and instantly see a generated NPC with a name, trait, and motivation. The result is automatically added to their session log. They can roll again for more results, switch categories, or review/export their session log at any time.

---

## 3. Project Boundaries

### 3.1. What's In-Scope for this Version

- Web app accessible via browser (no install required).
- Category pages for organizing table sets: **NPCs** and **Weapons/Items** as the initial two categories.
- Rolling on table sets that combine 1 or more random tables into a single generated result.
- A session log that captures all generated results during a session.
- Export session log as plain text.
- Table data stored as JSON files, with sample/placeholder content included.
- Clean, functional UI — desktop-first but usable on other screen sizes.

### 3.2. What's Out-of-Scope (Non-Goals)

- User accounts or authentication — no login system, everything is local.
- In-app table editing — tables are managed by editing JSON files directly, not through a UI.
- Combat or encounter tracking — no initiative, HP, or combat management features.
- Locations/Regions and Monsters/Creatures categories — these can be added later as new JSON table sets.
- Mobile-optimized layout — responsive is a nice-to-have, but not a priority.
- Real Vaults of Vaarn content — V1 uses placeholder data; real content is added post-launch.
