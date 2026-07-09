# Fan Activity Reward Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the trial fan activity closure with store activity applications, approved fan-visible activity cards, 10 second engagement tasks, and explicit reward tier rules.

**Architecture:** Add focused pure helpers in `frontend/src/utils/fanActivityRules.js` and test them first. Wire those helpers into the existing Store Owner and Fan Campaign tabs while preserving localDb/Supabase fallback behavior.

**Tech Stack:** React, Ant Design, localStorage localDb, Vitest, Vite.

## Global Constraints

- Do not install new dependencies.
- Do not edit `.env`.
- Use TypeScript project conventions where applicable; this repo currently uses JSX/MJS in the touched modules.
- Run `npm test` after functional changes.

---

### Task 1: Activity and Reward Rule Helpers

**Files:**
- Create: `frontend/src/utils/fanActivityRules.js`
- Create: `frontend/src/utils/fanActivityRules.test.mjs`

**Interfaces:**
- Produces: `buildStoreActivityCampaign(input)`, `filterFanVisibleStoreActivities(campaigns, fan)`, `canClaimTimedTask(records, fanId, taskKey, now)`, `buildRewardTierRules()`

- [ ] Write failing tests for approved activity visibility, daily task limits, and reward tiers.
- [ ] Run `npm test -- src/utils/fanActivityRules.test.mjs` and confirm failure.
- [ ] Implement helper functions.
- [ ] Run `npm test -- src/utils/fanActivityRules.test.mjs` and confirm pass.

### Task 2: Store Activity Application Form

**Files:**
- Modify: `frontend/src/pages/store-owner/StoreOwnerPage.jsx`

**Interfaces:**
- Consumes: `buildStoreActivityCampaign(input)`
- Produces: a pending campaign record in `localDb.insert("campaigns", record)`

- [ ] Add modal state and form fields for title, content, gift, date range, and fan points.
- [ ] Add a Campaigns tab button for submitting a store activity.
- [ ] Save as a pending store application campaign and show it in the store campaign list as pending approval.

### Task 3: Fan Activity Center

**Files:**
- Modify: `frontend/src/pages/fans/tabs/CampaignTab.jsx`
- Modify: `frontend/src/index.css`

**Interfaces:**
- Consumes: `filterFanVisibleStoreActivities`, `canClaimTimedTask`
- Produces: fan-visible store activity cards and 10 second claim modal

- [ ] Replace immediate task points with countdown modal.
- [ ] Display approved store activities separately from official timed tasks.
- [ ] Save completed timed tasks to `fan_engagement_tasks` and call `addFanPoints`.

### Task 4: Verification

**Files:**
- Modify: `frontend/src/utils/legal-content.js` if reward copy needs centralization.

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Use Playwright on local preview for fan activity and store application smoke checks.
