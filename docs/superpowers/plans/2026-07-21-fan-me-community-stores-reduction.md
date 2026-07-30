# Fan Me Community Stores Reduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce and brand-polish the real fan `Me`, `Community`, and `Stores` pages without changing business rules, navigation behavior, or backend data flow.

**Architecture:** Keep the current real fan shell and tab routing. Make only scoped UI changes inside the three fan-facing surfaces, reuse existing point/check-in/store/community logic, and add explicit visual asset slots so each page has distinct imagery instead of repeated fallback pictures.

**Tech Stack:** React, TypeScript-aware project conventions, Ant Design, Leaflet, localStorage/local DB, Vitest, Vite.

## Global Constraints

- Use the real fan app only: `http://127.0.0.1:5173/fan-app.html#/fan-center`
- Do not use `/preview/fan`
- Do not change database schema, Supabase migrations, backend APIs, permissions, `.env`, or install new dependencies
- Do not add new business rules unless the user explicitly approves them first
- Keep fan UI default English-first; Arabic must not break layout
- Keep the brand accent yellow-green as an accent, not as every button/text color
- Preserve all existing fan flows: check-in, scan, rewards, invite, old fan verification, help, community points, and store discovery
- Every UI change must be verified against the real page state before code is finalized
- Visual assets must use distinct image sources; do not reuse one repeated image across unrelated slots unless the user approves it

---

### Task 1: Real Page QA Baseline And Asset Map

**Files:**
- Create: `frontend/output/playwright/task-103-fan-me-community-stores-qa/metrics.json`
- Create: `frontend/output/playwright/task-103-fan-me-community-stores-qa/me-desktop.png`
- Create: `frontend/output/playwright/task-103-fan-me-community-stores-qa/community-desktop.png`
- Create: `frontend/output/playwright/task-103-fan-me-community-stores-qa/stores-desktop.png`
- Create: `frontend/output/playwright/task-103-fan-me-community-stores-qa/me-mobile.png`
- Create: `frontend/output/playwright/task-103-fan-me-community-stores-qa/community-mobile.png`
- Create: `frontend/output/playwright/task-103-fan-me-community-stores-qa/stores-mobile.png`

**Interfaces:**
- Consumes: the real fan shell routes already in `FanCenterPage.jsx`
- Produces: baseline screenshots and a concrete asset list for the three pages

- [ ] **Step 1: Capture the live `Me` page**

Open `#/fan-center`, switch to `Me`, and record the visible sections, repeated text blocks, long cards, and any overflow on desktop and mobile.

- [ ] **Step 2: Capture the live `Community` page**

Record current hero content, composer, post cards, comment blocks, and repeated image slots.

- [ ] **Step 3: Capture the live `Stores` page**

Record the hero, filter row, map frame, selected store panel, and any bottom-nav overlap.

- [ ] **Step 4: Write the asset map**

List every image slot that needs a distinct source and mark each one as one of:
`official UWELL source`, `public social source`, or `local mockup fallback`.

- [ ] **Step 5: Save the baseline**

Store the screenshots and metric notes for later comparison.

---

### Task 2: Me Page Reduction And Identity Polish

**Files:**
- Modify: `frontend/src/pages/fans/FanCenterPage.jsx`
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/utils/translations.js` only if copy needs tightening
- Test: `frontend/src/pages/fans/FanCenterPage.me-reduction.static.test.mjs`

**Interfaces:**
- Consumes: `renderProfile()`, `LevelBadge`, current point/history data, `LanguageSwitcher`
- Produces: a lighter fan profile page with fewer text blocks and clearer action hierarchy

- [ ] **Step 1: Write the failing static test**

Assert that the `Me` page keeps one hero, one compact stats row, one reduced history stack, and one smaller utility grid; assert it no longer reads like four separate dashboard panels stacked with identical weight.

- [ ] **Step 2: Reduce the hero section**

Keep avatar, name, level, and two primary actions only. Remove any extra explanatory copy that repeats the same meaning as the cards below.

- [ ] **Step 3: Collapse repeated history surfaces**

Convert the current multiple history panels into a tighter summary-first layout with fewer visible rows by default and clearer "view more" style affordances.

- [ ] **Step 4: Tighten the utility grid**

Keep `Invite`, `Old fan verification`, `Help`, and `Community`, but make the cards visually lighter and more compact so the page does not feel like a settings dashboard.

- [ ] **Step 5: Add one identity visual slot**

Add one dedicated fan profile visual asset area so the page feels branded without duplicating rewards or store imagery.

- [ ] **Step 6: Update copy only where needed**

Replace long helper lines with short fan-facing labels. Do not change the actual rules or point logic.

- [ ] **Step 7: Verify the static test passes**

Run the new page-focused test and ensure it asserts the compact profile layout and the preserved actions.

---

### Task 3: Community Page Visual Diversification And Feed Reduction

**Files:**
- Modify: `frontend/src/pages/fans/tabs/CommunityTab.jsx`
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/utils/translations.js` only if copy needs tightening
- Add assets: `frontend/public/uwell-assets/community/task103-*`
- Test: `frontend/src/pages/fans/tabs/CommunityTab.reduction.static.test.mjs`

**Interfaces:**
- Consumes: current community posts/comments/points logic, `localDb`, `addFanPoints`
- Produces: a more visual community page with distinct media slots and less text density

- [ ] **Step 1: Write the failing static test**

Assert that the community page still has post creation, likes, and comments, but now exposes at least two distinct image/media slots and a reduced rule hint block.

- [ ] **Step 2: Replace the generic hero with a branded story strip**

Keep the community title and short intro, but make the top section image-led and reduce the amount of descriptive copy.

- [ ] **Step 3: Give the composer a cleaner structure**

Keep the text area, post button, and add-photo affordance, but remove extra visual weight from the composer card.

- [ ] **Step 4: Diversify post media**

Map the first visible posts to distinct product/community visuals instead of the same placeholder image path. Use official or public sources first; if no safe source exists, add local mockup files with unique filenames.

- [ ] **Step 5: Tighten each post card**

Keep author, time, category, copy, likes, and comments, but reduce redundant chips and make media treatment consistent.

- [ ] **Step 6: Keep point rules visible but smaller**

Preserve the daily limits and earned points logic, but shorten the rule hint into a compact strip so the page stays premium and not text-heavy.

- [ ] **Step 7: Verify the static test passes**

Confirm the page still supports posting, liking, commenting, and point updates.

---

### Task 4: Stores Page Fan-Safe Discovery Reduction

**Files:**
- Modify: `frontend/src/pages/fans/tabs/MapTab.jsx`
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/utils/translations.js` only if copy needs tightening
- Add assets: `frontend/public/uwell-assets/stores/task103-*`
- Test: `frontend/src/pages/fans/tabs/MapTab.fan-reduction.static.test.mjs`

**Interfaces:**
- Consumes: `getFanSafeStores()`, `getFanFacingStorePresentation()`, `getStoreExposureScore()`, `sortStoresForFanExposure()`
- Produces: a cleaner fan store discovery page with one map, one selected-store card, and distinct store visuals

- [ ] **Step 1: Write the failing static test**

Assert the page still uses the real Leaflet map and fan-safe store exposure logic, while the selected-store panel now has a clearer visual hierarchy and no internal store fields leak.

- [ ] **Step 2: Simplify the hero and filter row**

Keep the title, summary, and filter chips, but make them lighter so the map remains the main object on the page.

- [ ] **Step 3: Rework the selected store detail**

Show store name, fan-safe label, trust chips, phone, and one primary navigate button. Remove extra internal or duplicated copy.

- [ ] **Step 4: Add distinct store image fallbacks**

Use approved store photos when available. If missing, provide separate fallback assets for brand store, recommended store, and standard store states instead of one repeated image.

- [ ] **Step 5: Keep internal fields hidden**

Ensure fan-facing text never exposes internal `is_s_store`, `s_store_status`, or cooperation notes.

- [ ] **Step 6: Verify the static test passes**

Confirm the map still renders, the selected card shows the correct fan-safe labels, and the store imagery is not repeated across all slots.

---

### Task 5: Real QA, Build, And Progress Log

**Files:**
- Modify: `PROGRESS.md`
- Create: `frontend/output/playwright/task-103-fan-me-community-stores-final/metrics.json`
- Create: `frontend/output/playwright/task-103-fan-me-community-stores-final/me-desktop.png`
- Create: `frontend/output/playwright/task-103-fan-me-community-stores-final/community-desktop.png`
- Create: `frontend/output/playwright/task-103-fan-me-community-stores-final/stores-desktop.png`
- Create: `frontend/output/playwright/task-103-fan-me-community-stores-final/me-mobile.png`
- Create: `frontend/output/playwright/task-103-fan-me-community-stores-final/community-mobile.png`
- Create: `frontend/output/playwright/task-103-fan-me-community-stores-final/stores-mobile.png`

**Interfaces:**
- Consumes: the updated fan pages and their static tests
- Produces: verified screenshots, final metrics, and a Task-103 progress entry

- [ ] **Step 1: Run the focused tests**

Run the new page-level static tests and the nearby fan regression set.

- [ ] **Step 2: Run the full frontend test suite**

Run `npm test` and confirm no unrelated fan flows regressed.

- [ ] **Step 3: Run the production build**

Run `npm run build` and confirm the app still builds cleanly.

- [ ] **Step 4: Do browser QA on the real fan URL**

Check desktop and mobile for `Me`, `Community`, and `Stores`, including overflow, bottom-nav overlap, and image uniqueness.

- [ ] **Step 5: Update `PROGRESS.md`**

Record the completed scope, changed files, verification results, and remaining notes.

- [ ] **Step 6: Commit the work**

Use a Chinese commit message and keep the change set rollback-friendly.

