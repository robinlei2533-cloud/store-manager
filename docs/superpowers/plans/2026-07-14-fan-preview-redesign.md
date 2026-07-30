# Fan Preview Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an isolated fan portal preview that demonstrates the approved UWELL brand membership hub direction without touching the live fan center.

**Architecture:** Add a new preview route and self-contained fan preview files under `frontend/src/pages/preview/`. The preview uses static realistic data, a dedicated CSS file, and no write operations. The live `frontend/src/pages/fans/FanCenterPage.jsx` remains unchanged until visual approval.

**Tech Stack:** React 19, React Router hash routes, Ant Design icons only, CSS modules by convention through a dedicated plain CSS import, Vitest static tests. No new dependencies.

## Global Constraints

- Do not install new dependencies.
- Do not edit `.env`.
- Do not modify the live fan center during this preview phase.
- Do not add more patch styles to `frontend/src/index.css`.
- Fan primary navigation must be fixed at the bottom and visible while scrolling.
- Fan primary navigation must contain exactly: Home, Activities, Community, Rewards, Stores, Me.
- Secondary pages must have a visible top-left back button.
- Old top tabs and new bottom navigation must never appear together in the preview shell.
- Preview must cover mobile 390px, tablet 768px, and desktop 1440px.
- Default visible copy should be English.

---

## File Structure

- Create `frontend/src/pages/preview/fan-preview-data.js`
  - Owns static preview data: member, activities, rewards, stores, community posts.
- Create `frontend/src/pages/preview/FanPreviewPage.jsx`
  - Owns preview shell, navigation state, and five first-batch screens.
- Create `frontend/src/pages/preview/fan-preview.css`
  - Owns all fan preview styling. Nothing goes into `index.css`.
- Create `frontend/src/pages/preview/FanPreviewPage.static.test.mjs`
  - Guards route isolation, navigation, fixed bottom nav, back buttons, and text density cues.
- Modify `frontend/src/App.jsx`
  - Adds lazy import and route `#/preview/fan`.

---

### Task 1: Add Preview Data And Static Contract

**Files:**
- Create: `frontend/src/pages/preview/fan-preview-data.js`
- Create: `frontend/src/pages/preview/FanPreviewPage.static.test.mjs`

**Interfaces:**
- Produces: `fanPreviewMember`, `fanPreviewActivities`, `fanPreviewRewards`, `fanPreviewStores`, `fanPreviewCommunityPosts`.
- Later tasks consume these named exports in `FanPreviewPage.jsx`.

- [ ] **Step 1: Write the failing static data test**

Create `frontend/src/pages/preview/FanPreviewPage.static.test.mjs` with:

```js
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const root = process.cwd();
const dataPath = path.join(root, 'src/pages/preview/fan-preview-data.js');
const pagePath = path.join(root, 'src/pages/preview/FanPreviewPage.jsx');
const cssPath = path.join(root, 'src/pages/preview/fan-preview.css');
const appPath = path.join(root, 'src/App.jsx');

const read = (filePath) => fs.readFileSync(filePath, 'utf8');

test('fan preview data exposes the first visual approval batch', () => {
  const source = read(dataPath);
  assert.match(source, /export const fanPreviewMember/);
  assert.match(source, /export const fanPreviewActivities/);
  assert.match(source, /export const fanPreviewRewards/);
  assert.match(source, /export const fanPreviewStores/);
  assert.match(source, /export const fanPreviewCommunityPosts/);
  assert.match(source, /Gold Member/);
  assert.match(source, /CALIBURN AIR/);
  assert.match(source, /S-Level Partner/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm test -- src/pages/preview/FanPreviewPage.static.test.mjs
```

Expected: FAIL because `fan-preview-data.js` does not exist.

- [ ] **Step 3: Add minimal preview data**

Create `frontend/src/pages/preview/fan-preview-data.js`:

```js
export const fanPreviewMember = {
  name: 'Maya Chen',
  id: 'UW-FAN-2588',
  level: 'Gold Member',
  points: 3850,
  nextLevel: 'Diamond',
  nextLevelPoints: 5000,
  city: 'Riyadh',
  dailyProgress: '1/3',
};

export const fanPreviewActivities = [
  {
    id: 'store-check-in-week',
    title: 'Store Check-in Week',
    product: 'CALIBURN AIR',
    reward: '+50 pts',
    location: 'UWELL S-Level Partner Store',
    imageLabel: 'Activity visual',
    steps: ['Join activity', 'Visit store', 'Verify with staff'],
    rules: 'Valid once per campaign. Store verification is required before points are added.',
  },
];

export const fanPreviewRewards = [
  {
    id: 'lanyard',
    title: 'UWELL Lanyard',
    points: 100,
    level: 'All members',
    imageLabel: 'Reward image',
  },
  {
    id: 'sample-kit',
    title: 'Sample Gift Box',
    points: 1200,
    level: 'Gold+',
    imageLabel: 'Gift box image',
  },
];

export const fanPreviewStores = [
  {
    id: 'riyadh-s-store',
    name: 'Riyadh Vape Hub',
    level: 'S-Level Partner',
    distance: '1.8 km',
    exposure: 'Recommended for strong UWELL display',
    imageLabel: 'Storefront photo',
  },
];

export const fanPreviewCommunityPosts = [
  {
    id: 'post-1',
    author: 'Ammar',
    title: 'My CALIBURN AIR setup',
    points: '+10 pts',
  },
];
```

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
npm test -- src/pages/preview/FanPreviewPage.static.test.mjs
```

Expected: PASS for the data test. Other tests in this new file can still fail in later tasks as they are added.

---

### Task 2: Build The Isolated Fan Preview Shell

**Files:**
- Modify: `frontend/src/pages/preview/FanPreviewPage.static.test.mjs`
- Create: `frontend/src/pages/preview/FanPreviewPage.jsx`
- Create: `frontend/src/pages/preview/fan-preview.css`

**Interfaces:**
- Consumes: named exports from `fan-preview-data.js`.
- Produces: default React component `FanPreviewPage`.

- [ ] **Step 1: Add failing shell tests**

Append to `FanPreviewPage.static.test.mjs`:

```js
test('fan preview page uses an isolated shell and dedicated css', () => {
  const source = read(pagePath);
  assert.match(source, /import '\.\/fan-preview\.css'/);
  assert.match(source, /className="fan-preview-shell"/);
  assert.match(source, /data-portal="fan-preview"/);
  assert.doesNotMatch(source, /from '\.\.\/fans\/FanCenterPage'/);
  assert.doesNotMatch(source, /<Tabs/);
  assert.doesNotMatch(source, /fan-center-tabs/);
});

test('fan preview bottom navigation has the approved six destinations', () => {
  const source = read(pagePath);
  assert.match(source, /const FAN_PREVIEW_NAV_ITEMS = \[/);
  for (const label of ['Home', 'Activities', 'Community', 'Rewards', 'Stores', 'Me']) {
    assert.match(source, new RegExp(`label: '${label}'`));
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/pages/preview/FanPreviewPage.static.test.mjs
```

Expected: FAIL because `FanPreviewPage.jsx` and CSS do not exist.

- [ ] **Step 3: Add minimal isolated shell**

Create `frontend/src/pages/preview/FanPreviewPage.jsx` with a component that:

- Imports `./fan-preview.css`.
- Imports Ant icons from `@ant-design/icons`.
- Imports preview data from `./fan-preview-data`.
- Defines `FAN_PREVIEW_NAV_ITEMS` with exactly six labels: Home, Activities, Community, Rewards, Stores, Me.
- Renders `<div className="fan-preview-shell" data-portal="fan-preview">`.
- Uses local `activeView` state.
- Renders `Home`, `Activity Detail`, `Reward Detail`, `Store Detail`, and `Me` as the first visual approval batch.
- Keeps the bottom nav visible for all views.

The implementation should not import or render `FanCenterPage`.

- [ ] **Step 4: Add minimal CSS hooks**

Create `frontend/src/pages/preview/fan-preview.css` with at least:

```css
.fan-preview-shell {
  min-height: 100dvh;
  background: #f8faef;
  color: #11160a;
}

.fan-preview-main {
  min-height: 100dvh;
  padding: 18px 16px 112px;
}

.fan-preview-bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  min-height: 76px;
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.94);
  border-top: 1px solid rgba(17, 22, 10, 0.12);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run:

```bash
npm test -- src/pages/preview/FanPreviewPage.static.test.mjs
```

Expected: PASS for data and shell tests.

---

### Task 3: Add Fixed Navigation, Back Behavior, And First-Batch Screens

**Files:**
- Modify: `frontend/src/pages/preview/FanPreviewPage.static.test.mjs`
- Modify: `frontend/src/pages/preview/FanPreviewPage.jsx`
- Modify: `frontend/src/pages/preview/fan-preview.css`

**Interfaces:**
- Consumes: `FAN_PREVIEW_NAV_ITEMS`.
- Produces: visible preview screens for Home, Activity Detail, Reward Detail, Store Detail, and Me.

- [ ] **Step 1: Add failing UX contract tests**

Append to `FanPreviewPage.static.test.mjs`:

```js
test('fan preview keeps bottom navigation fixed and reserves content space', () => {
  const css = read(cssPath);
  assert.match(css, /\.fan-preview-bottom-nav\s*{[^}]*position:\s*fixed/s);
  assert.match(css, /\.fan-preview-bottom-nav\s*{[^}]*bottom:\s*0/s);
  assert.match(css, /\.fan-preview-main\s*{[^}]*padding:[^;}]*112px/s);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
});

test('fan preview secondary pages include back controls', () => {
  const source = read(pagePath);
  assert.match(source, /className="fan-preview-back"/);
  assert.match(source, /Activity Detail/);
  assert.match(source, /Reward Detail/);
  assert.match(source, /Store Detail/);
});

test('fan preview home has brand membership and game growth priorities', () => {
  const source = read(pagePath);
  assert.match(source, /Brand Member Hub/);
  assert.match(source, /Gold Member/);
  assert.match(source, /Scan/);
  assert.match(source, /Check in/);
  assert.match(source, /Featured Activity/);
  assert.match(source, /Popular Rewards/);
  assert.match(source, /Nearby UWELL Store/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/pages/preview/FanPreviewPage.static.test.mjs
```

Expected: FAIL until the detailed screen structure and CSS are present.

- [ ] **Step 3: Implement the screen structure**

Update `FanPreviewPage.jsx` so:

- `Home` contains a brand header, membership card, Scan and Check in actions, featured activity, popular rewards, and nearby store.
- `Activity Detail` contains image placeholder, reward, location, steps, collapsed rules using `<details>`.
- `Reward Detail` contains image placeholder, point cost, level requirement, pickup method, back button.
- `Store Detail` contains storefront image placeholder, store level, distance, exposure reason, navigation action, back button.
- `Me` contains member identity, invite entry, old fan verification entry, guide entry, language placeholder.

- [ ] **Step 4: Implement responsive CSS**

Update `fan-preview.css` so:

- Mobile is the default.
- At `min-width: 768px`, content width increases and cards can use two columns.
- At `min-width: 1200px`, shell uses a desktop preview layout with the bottom nav still fixed.
- Buttons use at least `min-height: 44px`.
- Text contrast uses dark text on light surfaces.

- [ ] **Step 5: Run tests to verify they pass**

Run:

```bash
npm test -- src/pages/preview/FanPreviewPage.static.test.mjs
```

Expected: PASS.

---

### Task 4: Add The Preview Route

**Files:**
- Modify: `frontend/src/pages/preview/FanPreviewPage.static.test.mjs`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- Consumes: `FanPreviewPage` default export.
- Produces: route `http://127.0.0.1:5173/index.html#/preview/fan`.

- [ ] **Step 1: Add failing route test**

Append to `FanPreviewPage.static.test.mjs`:

```js
test('app exposes an isolated fan preview route', () => {
  const source = read(appPath);
  assert.match(source, /const FanPreviewPage = React\.lazy\(\(\) => import\('\.\/pages\/preview\/FanPreviewPage'\)\)/);
  assert.match(source, /path: "\/preview\/fan", element: <FanPreviewPage \/>/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/pages/preview/FanPreviewPage.static.test.mjs
```

Expected: FAIL because the route is not registered.

- [ ] **Step 3: Register the preview route**

Modify `frontend/src/App.jsx`:

```jsx
const FanPreviewPage = React.lazy(() => import('./pages/preview/FanPreviewPage'));
```

Add this route before the wildcard route:

```jsx
{ path: "/preview/fan", element: <FanPreviewPage />, errorElement: routeErrorElement },
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
npm test -- src/pages/preview/FanPreviewPage.static.test.mjs
```

Expected: PASS.

---

### Task 5: Visual And Build Verification

**Files:**
- No production file changes unless verification finds a preview-only defect.

**Interfaces:**
- Consumes: preview route from Task 4.
- Produces: screenshots for visual approval.

- [ ] **Step 1: Run full build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 2: Run targeted preview test**

Run:

```bash
npm test -- src/pages/preview/FanPreviewPage.static.test.mjs
```

Expected: PASS.

- [ ] **Step 3: Start or reuse local server**

If `http://127.0.0.1:5173` is not already serving `frontend/dist`, start the existing local server method used by this project. Do not install anything.

Preview URL:

```text
http://127.0.0.1:5173/index.html#/preview/fan
```

- [ ] **Step 4: Capture screenshots**

Capture screenshots at:

- 390px mobile
- 768px tablet
- 1440px desktop

The screenshots must show:

- Home.
- Activity Detail.
- Reward Detail.
- Store Detail.
- Me.

- [ ] **Step 5: Manual acceptance pass**

Confirm:

- Bottom navigation stays fixed at the bottom.
- Bottom navigation remains visible on secondary pages.
- Secondary pages show back button.
- Home first screen feels like UWELL brand membership plus game-like growth.
- No old tabs appear.
- No dense paragraph block dominates the first screen.
- No content is hidden behind bottom navigation.

## Self-Review

- Spec coverage: The plan covers isolated preview, fan first-batch pages, fixed bottom nav, back button, no old tabs, and screenshot acceptance.
- Placeholder scan: No TBD/TODO placeholders remain.
- Scope control: Store and admin are intentionally excluded from this plan until the fan preview is accepted.
- Dependency control: No new dependency is required.
