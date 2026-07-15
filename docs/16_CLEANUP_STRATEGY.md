# UWELL CRM Cleanup Strategy

Date: 2026-07-15

## Purpose

This document decides how to clean the current mixed working tree without losing useful work or continuing from rejected experiments.

It follows:

- `14_VERSION_BASELINE.md`
- `15_DIRTY_WORKING_TREE_AUDIT.md`

No code is changed by this document.

## Current Version Summary

Safe code baseline:

```text
Branch: codex/uwell-trial-ops-sync
Commit: eb87aae
Commit date: 2026-07-09 16:29:55 +0800
Commit subject: 优化粉丝活动展示内容
```

Current local working tree:

- Not a clean version.
- Contains 73 modified tracked files.
- Contains many untracked docs, tests, preview files, admin-ops files, assets, and patches.
- Should not be committed as one batch.
- Should not be reset as one batch without reviewing useful work.

## Cleanup Goal

The goal is to produce a safe development baseline for the next real product work:

1. Keep the new documentation roadmap.
2. Preserve the latest committed trial-operation product functions.
3. Do not use rejected preview fan page as the real fan app base.
4. Stop global UI/style pollution from spreading.
5. Review uncommitted changes by module before deciding keep/reject.
6. Start future product work from a known baseline.

## Options Considered

### Option A: Keep Everything And Continue

Description:

Continue developing from the current dirty working tree.

Pros:

- Fastest short-term.
- Keeps all recent uncommitted work.

Cons:

- Highest risk.
- Mixes accepted docs, rejected fan preview, broad UI changes, admin additions, data changes, tests, and assets.
- Likely continues the "mixed old/new UI" problem.
- Hard to know which behavior is intentional.

Decision:

Reject.

### Option B: Hard Reset To `eb87aae`

Description:

Reset all code and untracked files back to the latest committed baseline.

Pros:

- Cleanest code state.
- Removes rejected experiments quickly.

Cons:

- Would destroy potentially useful docs, tests, audit files, assets, and admin/rules work.
- Too destructive without a reviewed backup.
- Violates the current project rule: do not revert/delete without explicit approval.

Decision:

Reject as immediate action.

### Option C: Keep Docs, Freeze Code, Review By Module

Description:

Keep docs 00-16 as project governance. Treat `eb87aae` as code baseline. Freeze all current uncommitted code changes until each group is reviewed and either kept, moved to reference, or rejected.

Pros:

- Preserves useful planning work.
- Avoids losing code accidentally.
- Prevents rejected preview logic from becoming product baseline.
- Allows controlled recovery of useful changes.
- Fits the user's required workflow.

Cons:

- Slower than reset or commit-all.
- Requires one more classification pass before development.

Decision:

Recommended.

## Recommended Strategy

Use **Option C: Keep Docs, Freeze Code, Review By Module**.

This means:

- The next product/code work starts conceptually from `eb87aae`.
- New docs 00-16 are kept as the planning and AI-development roadmap.
- Current uncommitted code is treated as a review pool, not as accepted product state.
- No feature work starts until the relevant changed files are classified.

## Immediate Keep List

These should be kept:

- `docs/00_PROJECT_VISION.md`
- `docs/01_PRODUCT_BIBLE.md`
- `docs/02_PRD.md`
- `docs/03_USER_FLOW.md`
- `docs/04_INFORMATION_ARCH.md`
- `docs/05_DATABASE.md`
- `docs/06_API.md`
- `docs/07_RBAC.md`
- `docs/08_DESIGN_SYSTEM.md`
- `docs/09_BUSINESS_RULES.md`
- `docs/10_AI_RULES.md`
- `docs/11_TASK_TEMPLATE.md`
- `docs/12_TEST_CASE.md`
- `docs/13_CODE_REVIEW.md`
- `docs/14_VERSION_BASELINE.md`
- `docs/15_DIRTY_WORKING_TREE_AUDIT.md`
- `docs/16_CLEANUP_STRATEGY.md`
- `docs/CHANGELOG.md`
- `docs/ROADMAP.md`

Reason:

- They do not affect runtime.
- They establish the product and development rules needed before more code changes.

## Freeze List

These should not be edited further until reviewed:

### Global UI

- `frontend/src/index.css`
- `frontend/src/styles/animations.css`

Reason:

- Largest diff.
- Affects all portals.
- Likely source of inconsistent UI.

### Fan Preview Experiment

- `frontend/src/pages/preview`

Reason:

- Experimental.
- User rejected it as the real fan app direction.
- Can remain as visual reference only if not routed into real product.

### Admin Ops New Module

- `frontend/src/pages/admin-ops`

Reason:

- Potentially useful.
- Must be checked against PRD, RBAC, and business rules before becoming official.

### Database / Rule Utilities

- `frontend/src/services/db/localDb.js`
- `frontend/src/services/db/seedData.js`
- `frontend/src/utils/fanPointsRules.js`
- `frontend/src/utils/uwellLaunchRules.js`
- `frontend/src/utils/uwellClosedLoop.js`

Reason:

- These may duplicate or change business rules.
- Must not be accepted without rule-source decision.

## Review Order

### Step 1: Documentation Baseline

Action:

- Keep docs 00-16.
- Use them as the source of future task decisions.

Result:

- Project has a stable roadmap even while code is dirty.

### Step 2: Fan Real Function Baseline

Action:

Review real fan files only:

- `frontend/src/pages/fans/FanCenterPage.jsx`
- `frontend/src/pages/fans/tabs/CheckInTab.jsx`
- `frontend/src/pages/fans/tabs/ScanTab.jsx`
- `frontend/src/pages/fans/tabs/CampaignTab.jsx`
- `frontend/src/pages/fans/tabs/CommunityTab.jsx`
- `frontend/src/pages/fans/tabs/MallTab.jsx`
- `frontend/src/pages/fans/tabs/MapTab.jsx`
- `frontend/src/pages/fans/tabs/InviteTab.jsx`
- `frontend/src/pages/fans/tabs/HowItWorksTab.jsx`

Decision target:

- Which current uncommitted fan changes preserve old functions?
- Which changes belong to rejected preview work?
- Which files should be reverted later?
- Which files need a new controlled redesign task?

### Step 3: Global CSS Decision

Action:

Audit `frontend/src/index.css` before any UI work.

Decision target:

- Keep only reusable fixes.
- Reject broad style patches that cause mixed UI.
- Move future fan/store/admin redesign styles into scoped files instead of global patching.

### Step 4: Store And Backend Freeze

Action:

Do not optimize store/backend yet.

Reason:

- User priority is to stabilize fan flow first.
- Store/backend have large uncommitted changes and should not be mixed into fan cleanup.

### Step 5: Database/API/Permission Review

Action:

Only review these when a real task needs them.

Reason:

- Database and permission changes are high impact.
- The user requires explicit confirmation before database or permission work.

## Future Code Cleanup Rules

When code cleanup begins, do not use broad destructive commands.

Forbidden without explicit confirmation:

- `git reset --hard`
- `git checkout -- .`
- deleting untracked folders
- deleting preview/admin-ops/test files
- applying bundle rollback over current workspace

Allowed after task confirmation:

- inspect diff
- write classification docs
- revert a specific file after user approval
- keep a specific file after user approval
- move reference-only files after user approval

## Product Decision For Next Real Development

The next real product work should be:

```text
Task-004: Fan Real Module Baseline Map
```

Goal:

- Map old real fan functions to the confirmed new fan IA.
- Decide which existing fan tab/function remains.
- Decide which function moves to Home, Activities, Community, Rewards, Stores, or Me.
- Identify which uncommitted fan changes are useful and which should be rejected.

This task should still not redesign UI yet. It prepares the safe fan implementation plan.

## Final Decision

Recommended cleanup path:

1. Keep docs 00-16.
2. Treat `eb87aae` as the code baseline.
3. Freeze all uncommitted code changes.
4. Review fan real modules first.
5. Do not use `frontend/src/pages/preview` as product baseline.
6. Do not continue broad CSS changes.
7. Do not touch database or permissions until a confirmed task requires it.

