# UWELL CRM GitHub Repository And Branch Hygiene Preflight

Date: 2026-07-30

Task: Task-160

Status: GitHub/release-branch preflight only. No commit, push, branch creation, cleanup, revert, file deletion, `.env` change, Supabase change, Vercel change, dependency install, or deployment was executed.

## Purpose

This preflight checks whether the current repository state is safe to move into the online deployment phase.

It does not decide final release content by itself. It records what must be reviewed before pushing to GitHub or using Vercel/Supabase preview deployment.

## Repository State

| Check | Result |
|---|---|
| Current branch | `codex/uwell-trial-ops-sync` |
| Upstream | `origin/codex/uwell-trial-ops-sync` |
| Branch relation | ahead of upstream by `2` commits |
| Git remote | `origin` points to `https://github.com/robinlei2533-cloud/store-manager.git` |
| Staged files | `0` |
| Working tree total entries | `236` |
| Modified tracked entries | `117` |
| Untracked entries | `119` |

Recent commits:

```text
bde58c7 优化粉丝端首页视觉层级
2f4d8d5 建立项目路标与AI协同规范文档
eb87aae 优化粉丝活动展示内容
6717c3e 完善粉丝活动与门店活动闭环
4bbaf8b 更正试运营公开预览地址
```

## Ignore Protection Check

The current ignore rules protect important local/generated files:

| Path / pattern | Current protection |
|---|---|
| `frontend/.env` | ignored by `frontend/.gitignore` |
| `frontend/dist/` | ignored by `frontend/.gitignore` |
| `frontend/node_modules/` | ignored by `frontend/.gitignore` |
| `frontend/output/` | ignored by root `.gitignore` |
| screenshots such as `*.png` | ignored by root `.gitignore` |

No tracked file was found for:

```text
frontend/.env
.env
frontend/dist
frontend/node_modules
frontend/output
```

## Release Hygiene Findings

### P0 Before Push Or Vercel Preview

| ID | Finding | Why it matters | Required action |
|---|---|---|---|
| GH-P0-1 | Working tree is not release-clean: `236` status entries. | A broad push could mix production code, docs, experiments, old scripts, and generated artifacts. | Build a reviewed release inclusion list before any `git add`, commit, or push. |
| GH-P0-2 | Key release files are untracked, including many `docs/*`, `frontend/src/pages/admin-ops/`, `frontend/public/uwell-assets/`, and `supabase/migrations/*`. | Vercel/GitHub deployment from a clean checkout will miss untracked files unless they are intentionally committed. | Decide which untracked source/docs/migrations/assets belong in the release branch. |
| GH-P0-3 | Supabase migrations are untracked. | Online Supabase setup cannot rely on local untracked migration files being present after clone/deploy. | Review and commit only approved migrations or record that migrations will be applied from another controlled source. |
| GH-P0-4 | Local generated/work directories exist, such as `.workbuddy/`, `design-preview/`, `manual-upload/`, and QA output. | These should not leak into the release branch unless explicitly required. | Keep excluded from release commit unless the user separately approves a specific artifact. |
| GH-P0-5 | Current branch is already ahead of upstream by `2` commits. | Remote state and local state are not identical; push strategy should be explicit. | Confirm whether to continue on this branch or create a dedicated release branch. |

### P1 Before Wider External Preview

| ID | Finding | Why it matters | Required action |
|---|---|---|---|
| GH-P1-1 | Many modified tracked files cover source, tests, docs, HTML entries, service worker, and Vite config. | The release is not a small docs-only delta; it is a broad trial implementation state. | Review grouped diff by area before staging. |
| GH-P1-2 | `frontend/src/pages/preview/` is untracked. | Prior project rules say not to use `/preview/fan` as implementation source. | Exclude preview pages from release unless a specific production route requires them and the user confirms. |
| GH-P1-3 | Local asset folder `frontend/public/uwell-assets/` is untracked and large. | Missing it may break visuals; committing it increases repository size. | Decide whether these assets are release-critical, and if yes, commit intentionally with source/fallback notes. |
| GH-P1-4 | Git reports LF-to-CRLF warnings on many files when diffing. | This can inflate diffs or create noisy future changes. | Avoid whole-repo formatting; consider `.gitattributes` only in a separate confirmed task. |

## Candidate Release Inclusion Groups

These groups likely need review for a Vercel preview release:

| Group | Examples | Recommended decision |
|---|---|---|
| Core frontend runtime | `frontend/src/**`, `frontend/index.html`, `frontend/fan-app.html`, `frontend/store-app.html`, `frontend/vite.config.js` | Include only after grouped review and full test/build pass. |
| Static tests | `frontend/src/**/*.test.mjs` | Include with the matching source changes. |
| Trial docs | `docs/19...` through `docs/37...`, `PROGRESS.md`, launch/readiness docs | Include as release evidence if the repo is the source of truth. |
| Supabase migrations | `supabase/migrations/20260718000100...` through `20260718000700...` | Include only after Supabase preflight confirms target environment and migration policy. |
| Local media assets | `frontend/public/uwell-assets/`, `frontend/src/assets/products/*` | Include if required by real routes and accepted by asset inventory. |

## Candidate Release Exclusion Groups

Do not stage these by default:

| Group | Examples | Reason |
|---|---|---|
| Local environment/secrets | `.env`, `.env.local`, `frontend/.env` | Must stay out of GitHub. |
| Build output | `dist/`, `frontend/dist/` | Vercel should build from source. |
| Dependencies | `node_modules/`, `.pnpm-store/` | Installed by CI/deployment. |
| QA artifacts | `frontend/output/`, `test-results/`, screenshots | Evidence can be referenced locally; do not commit unless explicitly requested. |
| Local helper/work folders | `.workbuddy/`, `design-preview/`, `manual-upload/` | Not part of runtime release by default. |
| Legacy repair scripts | `fix*.mjs`, `*_patch*.cjs`, one-off local scripts | Exclude unless a script is still required by package scripts or release process. |
| Preview implementation | `frontend/src/pages/preview/` | Exclude unless separately approved because real Fan work must not come from preview pages. |

## Recommended Branch Strategy

Recommended path:

1. Keep `codex/uwell-trial-ops-sync` as the working integration branch.
2. Create a dedicated release candidate branch only after the inclusion list is confirmed, for example:

```text
release/trial-preview-20260730
```

3. Stage by reviewed groups, not with `git add .`.
4. Commit in small Chinese messages, for example:

```text
记录试运营上线交接与Git预检
纳入试运营前端闭环实现
纳入S Store Supabase迁移草案
纳入试运营视觉资产
```

5. Push the release candidate branch to GitHub.
6. Connect Vercel to that branch for preview deployment.

## Stop Conditions

Do not push or deploy if:

1. `.env` or secret values appear in staged files.
2. release staging requires `git add .` because the inclusion set is not reviewed.
3. `frontend/public/uwell-assets/` is omitted while real routes depend on those images.
4. Supabase migrations are omitted while remote acceptance assumes them.
5. preview-only pages are staged without explicit approval.
6. generated output, screenshots, or local helper folders are staged unintentionally.
7. `npm test` or `npm run build` fails after final staging.

## Next Task

Task-161 should be Supabase Preview/Production Environment Preflight.

Before that task starts, the user or business should confirm:

1. whether to continue using `origin` as `https://github.com/robinlei2533-cloud/store-manager.git`;
2. whether to create `release/trial-preview-20260730` or use another release branch name;
3. whether Supabase migrations in `supabase/migrations/` are the intended online migration source;
4. whether `frontend/public/uwell-assets/` should be committed for Vercel preview stability.
