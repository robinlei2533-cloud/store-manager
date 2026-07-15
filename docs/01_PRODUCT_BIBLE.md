# UWELL CRM Product Bible

This is the highest-level product reference. When specs, code, or AI suggestions conflict, this document wins unless the user explicitly changes it.

## Product Principles

1. One product, three separate portals.
2. A user account must have one clear identity and permission scope.
3. Backend login must never expose public registration.
4. Only Admin can create Manager or Field Rep accounts.
5. Manager cannot create accounts.
6. Store users manage only their own store data.
7. Fans manage only their own fan data.
8. Field reps see only assigned-region or assigned-store data.
9. Manager sees assigned-region data.
10. Admin sees all regions and all warehouses.
11. Any statistic must come from data, not invented UI numbers.
12. No page may contain duplicate versions of the same function.
13. Any business rule may have only one official version.
14. If requirements are unclear, stop and ask.

## Portal Boundaries

| Portal | Role | Main Purpose |
|---|---|---|
| Fan app | Fan | Growth, points, activities, community, rewards, store map |
| Store app | Store owner/staff | Verification, campaigns, photos, materials, store profile |
| Backend | Admin/Manager/Rep | Operations, review, rules, visits, materials, data, permissions |

Fans should not be trapped in the store portal. Stores should not be trapped in the fan portal. Backend users should enter through backend login only.

## Product Experience Principles

### Fan App

- Young, yellow-green, game-growth feeling.
- Short copy, icon/image-first, low text density.
- Fixed bottom navigation.
- Core nav: Home, Activities, Community, Rewards, Stores, Me.
- Home focuses on check-in, scan, activities, nearby stores, recommended rewards.
- Store map must show actual store-map logic and S/A/B/C exposure behavior.

### Store App

- Practical workbench, not a marketing page.
- Fixed bottom navigation.
- Core nav: Home, Verify, Activities, Me.
- Home shows today work, verification, campaigns, photos/materials status.
- Stores verify participation or pickup; they do not manually give points.

### Backend

- Operations console, not decorative dashboard.
- Dashboard shows segmented data and pending work.
- Rewards, Scan Codes, Materials, Field Visits, Reviews, Risk Center, Settings must be separated.
- Complex rules must live in dedicated modules, not crowded into Dashboard.

## Rule Source Priority

When there is a conflict:

1. `01_PRODUCT_BIBLE.md`
2. `09_BUSINESS_RULES.md`
3. `07_RBAC.md`
4. `05_DATABASE.md`
5. `08_DESIGN_SYSTEM.md`
6. Page-specific PRD or design docs
7. Current code

Current code is evidence of implementation, not always evidence of correct product direction.

## Change Log Requirement

Every future meaningful change must record:

1. What changed
2. Why it changed
3. Which pages it affects
4. Which database tables it affects
5. Follow-up notes
6. Next recommendation

