# UWELL CRM API Specification

## Current API Layer

Current API files live in `frontend/src/services/api`.

The API layer supports Supabase calls with local fallback in some modules. This is useful for trial, but production behavior must be Supabase-first and auditable.

## Current API Groups

| Group | Main Functions |
|---|---|
| Campaigns | get/create/update/delete campaigns, tasks, reports |
| Dashboard | dashboard stats, visit trend, store distribution, scan trend |
| Evaluations | store evaluation CRUD |
| Fans | fan list/detail, points log, add fan points |
| Materials | material catalog, stocks, inbound, outbound |
| Points | point rules and level rules |
| Products | product CRUD |
| Profiles | staff/profile list and update |
| QR Codes | code CRUD, scan code, scan records |
| Rewards | create redemption, confirm pickup |
| Stores | store CRUD |
| Visits | visit CRUD, sales, photos |

## API Design Principles

- API functions must map to one business concept.
- Do not put reward logic inside materials APIs.
- Do not put scan-code logic inside fan UI components.
- Do not put permission decisions only inside page components.
- Local fallback must not silently hide production errors in final launch mode.
- Every mutation that affects rules, points, rewards, stock, or permissions must be auditable.

## Required API Documentation For New Work

Every new API or API change must document:

1. Function name
2. Purpose
3. Input
4. Output
5. Error cases
6. Permission requirement
7. Database tables touched
8. Whether local fallback is allowed

## Supabase RPCs Currently Known

- `get_low_stock_count`
- `get_visit_trend`
- `get_scan_trend`
- `scan_qr_code`
- `confirm_reward_pickup`

