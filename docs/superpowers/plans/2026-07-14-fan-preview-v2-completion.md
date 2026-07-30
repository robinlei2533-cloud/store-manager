# Fan Preview V2 Completion Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the isolated fan preview from a structural sample into a fuller UWELL yellow-green brand membership preview with the expected fan functions represented.

**Architecture:** Keep the existing isolated `#/preview/fan` route and current preview file boundaries. Expand static preview data, enrich the preview screens, and revise only `fan-preview.css` for stronger yellow-green visual direction. The live fan center stays untouched.

**Tech Stack:** React 19, `@ant-design/icons`, plain CSS, Vitest static tests. No new dependencies.

## Global Constraints

- Do not modify the live fan center.
- Do not modify store or admin portals.
- Do not add styles to `frontend/src/index.css`.
- Do not install dependencies.
- Keep bottom navigation fixed on every fan preview view.
- Keep the six primary nav items: Home, Activities, Community, Rewards, Stores, Me.
- Keep secondary back controls.
- Default visible copy is English.

---

## Files

- Modify `frontend/src/pages/preview/fan-preview-data.js`
  - Add richer static data for tasks, activity types, reward tiers, store details, level benefits, invite, old fan verification, and guide.
- Modify `frontend/src/pages/preview/FanPreviewPage.jsx`
  - Expand the six nav pages so each expected function is represented in the preview.
- Modify `frontend/src/pages/preview/fan-preview.css`
  - Bring the visual direction closer to UWELL yellow-green: darker premium surfaces, stronger neon yellow-green, more product/packaging energy, better growth/task cards.
- Modify `frontend/src/pages/preview/FanPreviewPage.static.test.mjs`
  - Add static guardrails for full function representation and stronger design tokens.

---

### Task 1: Add V2 Functional Coverage Tests

**Files:**
- Modify: `frontend/src/pages/preview/FanPreviewPage.static.test.mjs`

- [ ] Add a failing test named `fan preview v2 represents the expected fan functions`.

Required source matches:

```js
for (const text of [
  'Daily check-in',
  'Scan UWELL unique code',
  '3 scans per day',
  'Official Activities',
  'Store Activities',
  'Store verification',
  'Like +1',
  'Comment +2',
  'First post +10',
  'Normal Rewards',
  'Premium Rewards',
  'Diamond Rewards',
  'Invite friends',
  'Old fan verification',
  'Member guide',
  'Level benefits',
  'Points history',
]) {
  assert.match(source, new RegExp(text.replace(/[+]/g, '\\\\+')));
}
```

- [ ] Run:

```bash
npm test -- src/pages/preview/FanPreviewPage.static.test.mjs
```

Expected: FAIL until V2 content is implemented.

---

### Task 2: Add V2 Visual Direction Tests

**Files:**
- Modify: `frontend/src/pages/preview/FanPreviewPage.static.test.mjs`

- [ ] Add a failing test named `fan preview v2 uses the approved yellow green premium direction`.

Required CSS/source matches:

```js
assert.match(css, /--fan-preview-lime:\s*#ccff00/);
assert.match(css, /--fan-preview-yellow:\s*#ffd60a/);
assert.match(css, /--fan-preview-ink:\s*#080d05/);
assert.match(css, /fan-preview-growth-ring/);
assert.match(css, /fan-preview-mission-card/);
assert.match(css, /fan-preview-reward-image-frame/);
assert.match(css, /fan-preview-neon-surface/);
```

- [ ] Run:

```bash
npm test -- src/pages/preview/FanPreviewPage.static.test.mjs
```

Expected: FAIL until V2 styling is implemented.

---

### Task 3: Expand Preview Data

**Files:**
- Modify: `frontend/src/pages/preview/fan-preview-data.js`

- [ ] Add exports:

```js
export const fanPreviewMissions = [...]
export const fanPreviewRewardTiers = [...]
export const fanPreviewLevelBenefits = [...]
export const fanPreviewGuidePoints = [...]
```

- [ ] Include these exact user-facing strings in data or page content:

- `Daily check-in`
- `Scan UWELL unique code`
- `3 scans per day`
- `Official Activities`
- `Store Activities`
- `Store verification`
- `Like +1`
- `Comment +2`
- `First post +10`
- `Normal Rewards`
- `Premium Rewards`
- `Diamond Rewards`
- `Invite friends`
- `Old fan verification`
- `Member guide`
- `Level benefits`
- `Points history`

- [ ] Run the targeted test. Expected: V2 content test may still fail until the page renders these strings.

---

### Task 4: Expand The Six Preview Screens

**Files:**
- Modify: `frontend/src/pages/preview/FanPreviewPage.jsx`

- [ ] Home:
  - Keep UWELL header, EN, profile, membership progress, Scan, Check in.
  - Add mission cards for daily check-in, unique code scan, activity, community.
  - Add featured official activity, store activity, reward preview, and S/A store preview.

- [ ] Activities:
  - Render an activities landing screen, not only one detail page.
  - Show `Official Activities` and `Store Activities`.
  - Include reward, location, steps, and `Store verification`.

- [ ] Community:
  - Show post card.
  - Show point rules: `Like +1`, `Comment +2`, `First post +10`.

- [ ] Rewards:
  - Render reward tier cards: `Normal Rewards`, `Premium Rewards`, `Diamond Rewards`.
  - Each card has image frame and level/points requirement.

- [ ] Stores:
  - Render recommended store list with S/A exposure cue.
  - Store detail still has navigation action and storefront visual.

- [ ] Me:
  - Show `Level benefits`, `Points history`, `Invite friends`, `Old fan verification`, `Member guide`.

- [ ] Keep detail pages reachable from Home cards.

- [ ] Run targeted test. Expected: content tests pass after this task.

---

### Task 5: Restyle To Yellow-Green Premium

**Files:**
- Modify: `frontend/src/pages/preview/fan-preview.css`

- [ ] Add CSS variables:

```css
:root {
  --fan-preview-lime: #ccff00;
  --fan-preview-yellow: #ffd60a;
  --fan-preview-ink: #080d05;
}
```

- [ ] Make preview feel closer to the approved direction:
  - Darker premium shell background.
  - Lime/yellow gradient highlights.
  - Stronger membership growth ring.
  - Mission cards with clearer game-like states.
  - Reward image frames.
  - Neon surface cards.

- [ ] Keep text contrast readable.

- [ ] Keep all tap targets at least 44px.

- [ ] Run targeted test. Expected: all preview tests pass.

---

### Task 6: Verify And Review

**Files:**
- No new files unless screenshots are regenerated.

- [ ] Run:

```bash
npm test -- src/pages/preview/FanPreviewPage.static.test.mjs
npm run build
```

Expected: both PASS.

- [ ] Regenerate or inspect screenshots for:
  - 390px mobile
  - 768px tablet
  - 1440px desktop

- [ ] Ask reviewer subagent for read-only review against:
  - Content completeness.
  - Yellow-green premium direction.
  - Fixed bottom nav.
  - No live fan center changes.

## Acceptance Criteria

- Preview still opens at `#/preview/fan`.
- It feels like UWELL yellow-green brand membership, not a generic clean app.
- The main fan functions are represented in preview.
- It is still less text-heavy than the old live page.
- Bottom navigation remains fixed on all views.
- No live portal files are changed except `App.jsx` route from V1.
