# UWELL CRM Pre-Launch Decision

Last updated: 2026-07-05

## Recommended Path

Choose a controlled external preview before public launch.

This means:

- keep local trial available for internal debugging;
- deploy one external preview URL for selected testers;
- do not connect a public custom domain yet;
- do not market the site publicly yet;
- use Supabase with strict role checks before collecting real production data.

## Current Readiness

| Area | Status | Notes |
|---|---|---|
| Local three-portal UX | Ready for trial | Fan, Store, and Admin smoke checks have passed locally. |
| Build pipeline | Mostly ready | Vite multi-entry build exists for `index.html`, `fan-app.html`, and `store-app.html`. |
| Test command | Ready | `npm test` is wired to Vitest. |
| Environment variables | Needs lock | Required public client vars are `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. |
| Deployment config | Preview-ready | Root and frontend Vercel configs both preserve Admin, Fan, and Store HTML entries. |
| Supabase schema | Partly ready | Alignment migration exists and has been pushed before. |
| Supabase RLS | Needs hardening | Base migration enables RLS but root migrations do not define complete role policies. |
| Local fallback | Decision needed | Helpful for demos, risky for real trial because cloud failures can silently use local data. |
| Monitoring | Not ready | `src/services/sentry.js` is currently a stub; no live monitoring is enabled. |
| Domain / SSL | Not needed yet | Wait until preview feedback is stable. |
| Privacy / Terms | Needed before real users | Required before collecting real fan/store data. |

## Deployment Decision

Recommended provider: Vercel.

Recommended project root: `frontend`.

Recommended settings:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: use the platform default, or `pnpm install --frozen-lockfile` if the project is standardized on pnpm.
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_ALLOW_LOCAL_AUTH_FALLBACK=false` for real preview data
  - `VITE_ALLOW_LOCAL_DB_FALLBACK=false` for real preview data

Reason: `frontend/vercel.json` is the cleanest deployment source for the current app. The root `vercel.json` has also been aligned so accidental root-level Vercel imports keep the three HTML entries working.

## Must Fix Before External Preview

1. Decide local fallback behavior for the first external preview.
   - Demo preview: allow fallback for selected demo accounts.
   - Real data preview: set `VITE_ALLOW_LOCAL_AUTH_FALLBACK=false` and make Supabase failures visible.
   - Real data preview: set `VITE_ALLOW_LOCAL_DB_FALLBACK=false` so API failures do not silently switch to localStorage.

2. Verify Supabase permissions.
   - Admin and manager can view company-wide operations.
   - Field reps only see assigned stores and related records.
   - Fans only see their own records.
   - Store owners only see their own store records.

3. Prepare preview accounts.
   - 1 admin
   - 1 manager
   - 2 field reps
   - 3-5 stores
   - 3-5 fans

4. Add minimal privacy and terms copy.
   - Fan registration currently asks for age/privacy confirmation.
   - Before real users, the linked policy text must exist.

## Can Wait Until Public Launch

- custom domain;
- public SSL/domain verification;
- analytics dashboards;
- full Sentry setup;
- large chunk optimization;
- production marketing pages;
- final legal review.

## Next Execution Plan

1. Choose demo-preview or real-data-preview mode.
2. Create a Supabase RLS verification checklist or SQL smoke queries.
3. Add minimal privacy and terms pages/copy.
4. Run `npm test`, `npm run build`, and local three-portal smoke test.
5. Deploy external preview after the user confirms provider and fallback mode.
