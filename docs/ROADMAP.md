# UWELL CRM Roadmap

## Current Status

### Completed

- Fan entry/login exists.
- Fan center has old functional modules: check-in, scan, rewards, invite, community, activities, store map.
- Store login/register exists.
- Store owner center exists.
- Backend Dashboard exists.
- Store, visit, evaluation, campaign, material, fan, settings modules exist.
- Supabase migrations and local DB exist.
- Role model for admin/manager/rep/fan exists.

### In Progress

- Fan UI and old function integration.
- Activity system refinement.
- Reward redemption and pickup rules.
- Store activity verification loop.
- Store exposure and map logic.
- Multi-region warehouse and material rules.
- RBAC hardening.

### To Optimize

- UI consistency across three portals.
- Fan app information hierarchy.
- Store app text density and workbench clarity.
- Backend module separation and dashboard clarity.
- Database rule consistency.
- API/local fallback production boundary.
- Arabic/RTL support.
- Version and backup cleanup.

### Current Bugs / Risks

1. Preview fan page is not the final product direction and may mislead development.
2. Old features and new UI can mix into a confusing interface.
3. Some rules exist in docs, constants, local DB, Supabase, and page logic at the same time.
4. Local fallback may hide production Supabase/RLS problems.
5. Multiple backups and `.bak` files make version source unclear.

## Next Recommended Tasks

### Task-001

Create Current Baseline Map:

- Which current files are trusted function sources.
- Which preview files are experimental only.
- Which old functions must be preserved.
- Which pages need redesign first.

### Task-002

Fan App IA-to-Current Mapping:

- Map old fan tabs to new nav.
- Confirm no function is removed.
- Decide which old functions become main pages, detail pages, or Me entries.

### Task-003

Fan App Home Redesign Plan:

- No code first.
- Define sections: level/points, check-in, scan, activities, rewards, nearby stores.
- Define old function reuse.

### Task-004

Fan App Activities Redesign Plan:

- Top engagement tasks.
- Official activities.
- Store activities.
- Empty state.
- Verification loop.

### Task-005

Fan App Rewards Redesign Plan:

- Category mall layout.
- Reward image slots.
- Locked/review/stock states.
- Store pickup link.

