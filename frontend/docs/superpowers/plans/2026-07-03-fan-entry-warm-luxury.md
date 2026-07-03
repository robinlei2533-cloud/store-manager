# Fan Entry Warm Luxury Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current busy fan-entry landing effects with an approved warm white `Uwell Fans Club` hero using CALIBURN glass-orb motion and modal login.

**Architecture:** Keep the existing `FanEntryPage.jsx` as the route owner and extract only the canvas effect into `CaliburnHeroCanvas.jsx`. Preserve existing auth/navigation logic, product data, language switcher, settings menu, and lower product strip behavior.

**Tech Stack:** React 19, Vite, Canvas 2D, Ant Design icons/message, existing local DB/auth stores, Playwright-based smoke script.

---

### Task 1: Add Regression Checks

**Files:**
- Modify: `scripts/ux-smoke.cjs`

- [ ] Add assertions that the fan-entry page renders `Uwell Fans Club`, does not render the old login card before clicking the CTA, and opens the login modal after clicking `Join / Sign in`.
- [ ] Run `node scripts/ux-smoke.cjs` and confirm the new assertions fail against the current implementation.

### Task 2: Add Caliburn Hero Canvas

**Files:**
- Create: `src/components/effects/CaliburnHeroCanvas.jsx`

- [ ] Implement a focused Canvas 2D component that receives `products`, draws warm mist, glass circles, and clipped CALIBURN product image cores.
- [ ] Support pointer parallax, resize handling, image preloading, and `prefers-reduced-motion`.

### Task 3: Rework Fan Entry Markup

**Files:**
- Modify: `src/pages/fan-entry/FanEntryPage.jsx`

- [ ] Remove imports and usage for `Galaxy`, `ClickSpark`, `Counter`, old particle canvas, aurora canvas, meteor shower, and GSAP entrance animation.
- [ ] Import and render `CaliburnHeroCanvas` inside a warm `fe-luxury-hero`.
- [ ] Replace permanent login card with a `Join / Sign in` CTA and modal login/register panel.
- [ ] Keep existing login/register handlers and product modal behavior.

### Task 4: Add Warm Luxury Styles

**Files:**
- Modify: `src/index.css`

- [ ] Add light-background header, hero, orb canvas, CTA, modal, and below-hero product/benefit styles.
- [ ] Preserve responsive behavior and prevent horizontal overflow.
- [ ] Restyle language/settings controls so they are visible on the warm white background.

### Task 5: Verify

**Files:**
- Use existing test/build scripts.

- [ ] Run `node scripts/ux-smoke.cjs`.
- [ ] Run `npm run build`.
- [ ] Run `node --test src/utils/uwellRoleAccess.test.mjs`.
- [ ] Review `git diff --check`.
