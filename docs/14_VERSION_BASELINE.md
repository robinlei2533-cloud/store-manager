# UWELL CRM Version Baseline Audit

Date: 2026-07-15

## Purpose

This document defines which project version should be used as the development baseline and how older versions, previews, bundles, backups, and experimental pages should be treated.

The goal is to prevent future work from continuing on the wrong version or mixing old functions, preview UI, and experimental logic without review.

## Executive Decision

The recommended development baseline is:

```text
C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm
Branch: codex/uwell-trial-ops-sync
Latest committed HEAD: eb87aae 优化粉丝活动展示内容
Primary app folder: frontend
```

Important distinction:

- **Git committed HEAD** is the safest code baseline.
- **Current working tree** contains many uncommitted changes and must be audited before more feature work.
- **The local running site may include uncommitted changes**, so screenshots alone cannot prove which committed version is correct.

Do not start a large UI or business refactor until the current dirty working tree is classified.

## Version Inventory

### 1. Active Main Project

| Path | Type | Status | Decision |
|---|---|---|---|
| `frontend` | Active app | Full React/Vite project, largest and latest working app folder | Continue from here after dirty-tree audit |
| `supabase` | Database migrations | Current Supabase schema/migration source | Keep |
| `database` | Older/local SQL assets | Historical/reference database files | Reference only |
| `docs` | Product and development docs | Current governance and roadmap docs | Keep as source of planning truth |

### 2. Git Branch And Commits

Current branch:

```text
codex/uwell-trial-ops-sync
```

Recent committed history:

| Commit | Meaning |
|---|---|
| `eb87aae` | Latest committed mainline: fan activity display optimization |
| `6717c3e` | Fan activity and store activity loop |
| `4bbaf8b` | Trial preview address correction |
| `7a6a155` | Trial fan/store/backend issue fixes |
| `37dd207` | Backend preview acceptance record |
| `143e472` | Trial preview reward loop seal |
| `2d98bdb` | Trial accounts and page acceptance seal |
| `47b38f5` | Preview launch and S-level redemption loop archive |

Decision:

- Use current branch as the main branch.
- Treat `eb87aae` as the latest committed safe baseline.
- Do not assume uncommitted files are safe until reviewed.

### 3. Bundle Archives

The root folder contains valid git bundle archives.

| Bundle | Commit / Type | Decision |
|---|---|---|
| `uwell-crm-local-archive-20260706-47b38f5.bundle` | Complete bundle at `47b38f5` | Recovery/reference |
| `uwell-trial-seal-20260707-2d98bdb.bundle` | Complete bundle at `2d98bdb` | Recovery/reference |
| `uwell-trial-operation-preview-seal-20260708-143e472.bundle` | Complete bundle at `143e472` | Recovery/reference |
| `uwell-trial-operation-preview-seal-20260708-37dd207.bundle` | Complete bundle at `37dd207` | Recovery/reference |
| `uwell-trial-issue-fix-20260709-7a6a155.bundle` | Complete bundle at `7a6a155` | Recovery/reference |
| `uwell-trial-issue-fix-20260709-4bbaf8b.bundle` | Complete bundle at `4bbaf8b` | Recovery/reference |
| `uwell-trial-ops-sync-03ee776.bundle` | Complete bundle at `03ee776` | Old recovery/reference |
| `uwell-trial-ops-sync-a04915d.bundle` | Complete bundle at `a04915d` | Old recovery/reference |
| `uwell-trial-ops-sync.bundle` | Incremental bundle requiring another ref | Not a standalone baseline |

Decision:

- Bundles are not active development folders.
- Do not overwrite current project from a bundle unless the user explicitly requests rollback.
- If rollback is needed, restore in a separate worktree/folder first and compare before replacing anything.

### 4. Backup And Upload Folders

| Path | Type | Observation | Decision |
|---|---|---|---|
| `backup_20260627_163514` | Early backup | Small early app snapshot | Historical reference only |
| `manual-upload.local-backup-20260702-173343` | Manual upload backup | Contains one manual upload project and patch | Historical reference only |
| `manual-upload` | Manual upload + patches | Contains 20260629 project and 20260705 patches | Reference only |
| `Uwell CRM更新` | Older update workspace | Contains separate fan/admin/store folders, fix scripts, screenshots | Reference only, not active baseline |
| `project_data` | Small data folder | Not active app | Reference only |
| `output` | Screenshots/output | QA evidence, not source | Keep as evidence only |
| `.workbuddy` | Tool metadata | Not product source | Ignore for product baseline |

Decision:

- None of these folders should be used as the main development source.
- They can be inspected only when recovering lost function details or old screenshots.

### 5. Design Preview

| Path | Type | Decision |
|---|---|---|
| `design-preview` | HTML visual preview and image assets | Visual reference only |

Known files:

- `uwell-three-portal-preview-20260710.html`
- `uwell-three-portal-preview-motion-20260710.html`
- `index.html`
- `images`

Decision:

- This folder is not a production app.
- It should not become the business logic baseline.
- It can guide visual style, motion direction, layout tone, and yellow-green brand feeling.

### 6. Fan Preview Page

| Path | Type | Decision |
|---|---|---|
| `frontend/src/pages/preview` | Experimental fan preview | Experimental only, not trusted product baseline |

Files:

- `FanPreviewPage.jsx`
- `fan-preview.css`
- `fan-preview-data.js`
- `FanPreviewPage.static.test.mjs`

Decision:

- This page should not replace the real fan center.
- It may be used as UI reference only after comparing against old real fan functions.
- Future fan work must upgrade `frontend/src/pages/fans` real modules, not rebuild disconnected logic inside preview.

### 7. Source `.bak` Files

The active `frontend/src` contains multiple `.bak` files.

Examples:

- `frontend/src/pages/fan-entry/FanEntryPage.jsx.bak`
- `frontend/src/pages/fans/FanCenterPage.jsx.bak`
- `frontend/src/pages/fans/tabs/CampaignTab.jsx.bak`
- `frontend/src/pages/fans/tabs/CommunityTab.jsx.bak`
- `frontend/src/pages/fans/tabs/InviteTab.jsx.bak`
- `frontend/src/pages/fans/tabs/ScanTab.jsx.bak`
- `frontend/src/pages/store-owner/StoreOwnerPage.jsx.bak`
- `frontend/src/pages/dashboard/DashboardPage.jsx.bak`
- `frontend/src/index.css.bak`

Decision:

- `.bak` files are not active code.
- They can be referenced only to recover lost behavior or copy.
- Do not edit `.bak` files as part of product development.
- Do not import from `.bak` files.

## Baseline Recommendation

### Recommended Main Baseline

Use:

```text
uwell-crm/frontend
on branch codex/uwell-trial-ops-sync
at latest committed HEAD eb87aae
plus reviewed documentation under docs
```

Why:

- It is the only complete active app.
- It contains the latest committed business work.
- It has Supabase migrations, local DB, route structure, tests, and three portals.
- It preserves the most recent trial-operation functionality.

### What Not To Use As Baseline

Do not use these as the direct development baseline:

- `design-preview`
- `frontend/src/pages/preview`
- `backup_20260627_163514`
- `manual-upload`
- `manual-upload.local-backup-20260702-173343`
- `Uwell CRM更新`
- bundle files
- `.bak` files

They are reference or recovery material only.

## Dirty Working Tree Warning

The current repository has many modified and untracked files.

This means there are two possible "current versions":

1. **Committed baseline**: what Git HEAD records.
2. **Local working version**: committed baseline plus uncommitted changes.

Before any functional redesign, run a dirty-tree audit:

- Which modified files belong to accepted work?
- Which modified files belong to rejected preview attempts?
- Which untracked files are useful tests/docs?
- Which untracked files are temporary artifacts?
- Which changes should be committed, reverted, or ignored?

Do not run broad rollback commands. Do not delete untracked files without explicit approval.

## Development Rule Going Forward

Before touching code, every task must state:

1. Which baseline it starts from.
2. Whether it touches real app code or preview/reference files.
3. Whether it preserves old functions.
4. Whether it affects database, API, permissions, or routes.
5. Whether it conflicts with docs 00-14.

## Next Recommended Task

Task-002 should be:

```text
Dirty Working Tree Audit
```

Goal:

- Classify all current modified/untracked files.
- Identify which changes should stay.
- Identify which changes are rejected/experimental.
- Create a safe list for future development.

Only after Task-002 should the project continue with fan app UI/function integration.

