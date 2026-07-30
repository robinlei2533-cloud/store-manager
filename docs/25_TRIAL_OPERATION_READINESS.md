# UWELL CRM Trial Operation Readiness

Date: 2026-07-30

Status: ready for internal trial path rehearsal and controlled demo walkthrough after Task-151 final real-route QA, Task-158 Fan Entry viewport correction, and Task-159 handoff summary.

This document turns the current three-portal MVP into a repeatable trial demo path. It does not change database schema, API, permissions, business rules, environment variables, dependencies, or runtime UI code.

## Current Evidence

Latest QA reference:

```text
frontend/output/playwright/task-151-final-path-rehearsal-qa/final-path-rehearsal-results.json
```

Latest UI correction reference:

```text
frontend/output/playwright/task-158-fan-entry-short-desktop-correction/fan-entry-short-desktop-results.json
```

Latest handoff package:

```text
docs/36_TRIAL_HANDOFF_PACKAGE_AND_FINAL_GO_NO_GO.md
```

Task-151 confirmed:

1. Fan, Store, Admin, Manager boundary, and Rep boundary paths all passed on real routes.
2. Audited page states: `34`.
3. Page-level horizontal overflow: `0`.
4. Visible broken images: `0`.
5. Diagnostics count: `0`.
6. Fan internal-data leak candidates after excluding known fan-facing reward pickup/level-protection wording: `0`.
7. Store S Report and Admin S Store/Rewards/Reviews/Users checks passed.
8. Manager regional boundary and Rep direct S Store route block/redirect passed.

Task-147 pre-demo issues have been superseded:

1. Store S Report history/demo evidence was resolved by Task-148.
2. Admin S Store table readability was resolved by Task-148.
3. Fan Rewards bottom navigation clearance was resolved by Task-148.
4. Trial-readiness UI target and warning polish was handled by Task-149 and Task-150.
5. Final real-route rehearsal QA passed in Task-151.

## Trial Goal

The trial must prove the core UWELL closed loop:

1. Fans join activities, scan products, earn points, redeem rewards, and find trusted stores.
2. Stores verify real fan actions, participate in campaigns, process reward pickup, and report S Store movement.
3. S Stores report sell-through, product stock, and material stock so backend operators can see terminal movement.
4. Admins and managers use backend queues, reviews, reward operations, S Store health, and access boundaries to run the system.
5. UWELL turns terminal data into better campaigns, rewards, replenishment, visits, and brand support.

## Portal Entry Points

| Portal | URL | Trial purpose |
|---|---|---|
| Fan App Login | `http://127.0.0.1:5173/fan-app.html#/fan-entry` | Fan account sign-in or demo fan entry |
| Fan App | `http://127.0.0.1:5173/fan-app.html#/fan-center` | Fan membership, scan, rewards, community, stores, profile |
| Store App Login | `http://127.0.0.1:5173/store-app.html#/store-login` | Store owner sign-in |
| Store App | `http://127.0.0.1:5173/store-app.html#/store-owner` | Store workbench, verify, activities, S Report, profile |
| Backend Login | `http://127.0.0.1:5173/#/admin` | Staff login |
| Backend Dashboard | `http://127.0.0.1:5173/#/app/dashboard` | Operator overview after staff login |
| Backend S Store | `http://127.0.0.1:5173/#/app/stores/s-stores` | S Store sell-through, inventory, replenishment, follow-up |

Do not use `/preview/fan` for trial operation checks.

## Trial Accounts

| Role | Email | Password | Recommended use |
|---|---|---|---|
| Fan | `fan.preview@uwell.com` | `UwellFan@2026` | Main Fan App demo account. |
| S Store owner | `store.owner@uwell.com` | `UwellStore@2026` | Main Store App demo account, bound to `s-real-012`. |
| Admin | `admin@uwell.com` | `UwellAdmin@2026` | Main backend demo account with full closed-loop visibility. |
| Manager | `manager@uwell.com` | `UwellManager@2026` | Regional boundary demo only. |
| Rep boundary | `rep2@uwell.com` | `UwellRep@2026` | Field rep access-boundary demo only. |

## Demo Order

### 1. Fan

Use `fan.preview@uwell.com`.

Recommended path:

```text
Login -> Home -> Scan -> Rewards -> Community -> Me
```

Show:

1. member identity, points, growth, and next action;
2. product-code scan path and daily rule visibility;
3. reward value, pickup/level protection wording, and redemption state;
4. community content and interaction;
5. account/history/help entries.

Message:

Fans enter a UWELL member system with trust, rewards, store access, and growth.

### 2. Store

Use `store.owner@uwell.com`, bound to `s-real-012`.

Recommended path:

```text
Login -> Home -> Verify -> Activities -> S Report -> Me
```

Show:

1. store identity and execution command;
2. controlled fan verification and pickup flow;
3. campaign participation and approval boundary;
4. S Report sell-through, product stock, material stock, and submitted-history evidence;
5. store profile and photo readiness.

Message:

Stores become semi-UWELL terminals that verify real behavior, execute campaigns, report terminal movement, and expose stock/material needs.

### 3. Admin

Use `admin@uwell.com`.

Recommended path:

```text
Login -> Dashboard -> S Store -> Rewards -> Reviews -> Users
```

Show:

1. operator dashboard and action queues;
2. S Store health, sell-through, stock signals, replenishment, and details;
3. reward operations;
4. review/approval work;
5. user and role visibility.

Message:

The backend is an operations console, not just a static dashboard.

### 4. Boundaries

Use:

1. `manager@uwell.com` to show regional boundary behavior.
2. `rep2@uwell.com` to show direct S Store route block/redirect.

Message:

Trial data visibility is controlled by role and region, not widened for demo convenience.

## Acceptance Checklist

### Fan App

1. Fan can enter the real Fan App.
2. Home, Scan, Rewards, Community, and Me render without route breakage.
3. Bottom navigation does not cover essential final content.
4. Page-level horizontal overflow remains `0`.
5. No visible broken images.
6. Fan pages do not expose internal S Store sell-through, inventory, replenishment, downgrade, correction, or audit data.

### Store App

1. Store owner can enter `s-real-012`.
2. Home, Verify, Activities, S Report, and Me are reachable.
3. S Report shows the confirmed V1 report areas and submitted-history evidence.
4. Store cannot manually award arbitrary fan points.
5. Page-level horizontal overflow remains `0`.
6. No visible broken images.

### Backend

1. Admin can enter Dashboard.
2. Admin can see S Store Management data and detail entry.
3. Rewards, Reviews, and Users render.
4. Manager regional boundary is respected.
5. Rep cannot access manager/admin-only S Store management features.
6. Page-level horizontal overflow remains `0`.
7. No visible broken images.

## Go / No-go

Internal trial path: Go.

Customer/demo current QA blockers: none found by Task-151.

Remaining known warning:

1. Vite `[PLUGIN_TIMINGS]` remains an existing build diagnostic.
2. `chunk larger than 300 kB` warning remains absent after Task-149.

Production launch remains separate from local trial readiness and still requires remote-mode acceptance, controlled Supabase/RLS/API evidence, final account/data setup, and operational ownership.

Latest production-readiness gap reference:

```text
docs/32_PRODUCTION_READINESS_ACCEPTANCE_GAP.md
```

Latest operations owner matrix:

```text
docs/34_PRODUCTION_TRIAL_OPERATIONS_OWNER_MATRIX.md
```

Current production-readiness decision:

1. Local internal trial: Go.
2. Controlled demo walkthrough: Go.
3. Wider external preview trial: Conditional Go after fallback-disabled page-level remote QA, live asset/dependency acceptance, and named owner assignments.
4. Production launch: No-go until remote acceptance, final environment/account/data setup, named operations ownership, and online deployment evidence are recorded.

Next phase:

1. GitHub repository and release-branch hygiene.
2. Supabase preview/production environment preflight.
3. Vercel preview deployment.
4. Fallback-disabled remote browser QA.
5. Live external asset/dependency acceptance.

## Do Not Change During Trial Readiness

1. Do not change point values or incentive policies.
2. Do not expose internal S Store data to fans.
3. Do not make store owners manually award points.
4. Do not widen manager global access for demo convenience.
5. Do not use `/preview/fan`.
6. Do not install dependencies.
7. Do not modify `.env`.
