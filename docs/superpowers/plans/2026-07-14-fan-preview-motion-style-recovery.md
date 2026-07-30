# Fan Preview Motion Style Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the isolated fan preview route back to the approved `uwell-three-portal-preview-motion-20260710.html` yellow-green, animated, product-led UI direction without touching live fan/store/admin pages.

**Architecture:** Keep the existing isolated React preview route and data module. Add deployable image references to preview data, update the page shell to render real image cards and motion-oriented elements, and replace the preview CSS with a light yellow-green motion system inspired by the approved HTML preview.

**Tech Stack:** React JSX, CSS, Vitest static tests, Vite public assets.

## Global Constraints

- Do not modify live fan center, store portal, admin portal, `.env`, or `frontend/src/index.css`.
- Do not install new dependencies.
- Keep fixed bottom navigation visible on every preview view.
- Keep Home / Activities / Community / Rewards / Stores / Me and the existing fan rules/function coverage.
- Use English UI text for this preview.

---

### Task 1: Lock Motion Preview Requirements

**Files:**
- Modify: `frontend/src/pages/preview/FanPreviewPage.static.test.mjs`

**Interfaces:**
- Consumes: existing static test file.
- Produces: failing tests for motion preview color tokens, animations, and deployable assets.

- [x] **Step 1: Write failing tests**
- [x] **Step 2: Run test to verify failure**

Run: `npm test -- src/pages/preview/FanPreviewPage.static.test.mjs`
Expected: FAIL because the current preview still uses the darker V2 palette and CSS-only visuals.

### Task 2: Apply Motion Preview UI To Isolated Fan Preview

**Files:**
- Modify: `frontend/src/pages/preview/fan-preview-data.js`
- Modify: `frontend/src/pages/preview/FanPreviewPage.jsx`
- Modify: `frontend/src/pages/preview/fan-preview.css`
- Create: `frontend/public/uwell-assets/*` copied from `design-preview/images/uwell-assets/*`

**Interfaces:**
- Consumes: `image` fields from data records.
- Produces: image-led preview cards, split welcome text, aurora background, count-up-style number styling, pulse rings, scan visual, and fixed bottom nav.

- [ ] **Step 1: Add image paths to preview data**
- [ ] **Step 2: Render image-backed cards and scan/store visuals**
- [ ] **Step 3: Replace dark V2 CSS with light yellow-green motion CSS**
- [ ] **Step 4: Copy required assets into Vite public assets**
- [ ] **Step 5: Run static test and build**

Run:
`npm test -- src/pages/preview/FanPreviewPage.static.test.mjs`
`npm run build`

Expected: static tests pass and build exits 0.
