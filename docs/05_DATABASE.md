# UWELL CRM Database Specification

## Current Data Strategy

The project currently uses two data layers:

1. Local trial database in `frontend/src/services/db/localDb.js`
2. Supabase migrations in `supabase/migrations`

Local DB is useful for demos and local fallback. Supabase is the production direction.

## Local DB Version

Current local DB version: `6.0`

## Core Tables

| Table | Purpose |
|---|---|
| profiles | Staff/user profiles and roles |
| stores | Store information, location, status, owner, level |
| visits | Field visit records |
| visit_sales | Sales data from visits |
| visit_photos | Visit evidence photos |
| products | UWELL products |
| fans | Fan profiles |
| fan_points_log | Fan point history |
| fan_points_rules | Point rule configuration |
| fan_level_rules | Fan level thresholds |
| materials | Material catalog |
| material_stocks | Warehouse/store stock records |
| material_inbound | Material inbound records |
| material_outbound | Material outbound records |
| store_evaluations | Store rating records |
| campaigns | Official and store campaigns |
| campaign_tasks | Campaign tasks |
| campaign_reports | Campaign execution reports |
| campaign_claims | Campaign participation/claim records |
| qr_codes | Product/activity/entry codes |
| scan_records | Scan history |
| fan_checkins | Fan check-in records |
| lottery_records | Lottery records |
| mall_redemptions | Reward redemption records |
| community_posts | Community posts |
| community_comments | Community comments |
| community_point_actions | Community point actions |
| fan_engagement_tasks | Official engagement task records |
| store_tasks | Store task records |
| material_requests | Store/field material requests |
| store_display_uploads | Store display and photo uploads |
| store_activity_verifications | Store verification records |
| store_exposure_events | Store map/view/navigation events |
| old_fan_verifications | Existing fan verification |
| fan_complaints | Fan complaints |
| reward_reviews | High-value reward reviews |
| warehouse_inventory_alerts | Warehouse low-stock alerts |
| s_store_status_history | Local/demo S Store promote, downgrade, restore, pause, and status history |
| s_store_sell_through | Local/demo S Store weekly/monthly open-system and disposable sell-through records |
| s_store_product_inventory_snapshots | Local/demo S Store product inventory snapshots and low-stock flags |
| s_store_material_inventory_snapshots | Local/demo S Store material inventory snapshots and low-stock flags |
| s_store_visit_details | Local/demo S Store field visit details and terminal market feedback |
| s_store_replenishment_tasks | Local/demo S Store low-stock and replenishment follow-up tasks |
| audit_logs | Critical operation records |
| auth | Local trial auth records |

## S Store Data Objects

As of Task-039, these objects exist in the local/demo database foundation only.

They are not yet Supabase tables and do not yet have production RLS policies.

| Data object | Purpose |
|---|---|
| S Store profile/status | Store-level S Store identity, source, became-S date, cooperation status, review metadata |
| S Store status history | Promote, downgrade, restore, pause, and status-change records |
| S Store sell-through records | Weekly/monthly open-system and disposable sold quantities |
| S Store product inventory | Open-system/disposable current stock, target stock, low-stock flag |
| S Store material inventory | Display, poster, lightbox, gift, campaign material, and other material quantities |
| S Store visit notes | Field rep S Store visit notes, market feedback, competitor situation, hot brands/flavors, support needed, photos |
| S Store replenishment follow-up | Low-stock or rep-triggered replenishment tasks, responsible rep, status, completion photos |
| S Store contribution metrics | Aggregated activity verifications, reward pickups, store-linked scans, and fan contribution signals |

S Store contribution metrics should be aggregated from existing operational records when possible instead of requiring manual store entry.

## S Store Local Foundation Status

Task-039 added the local/demo foundation for:

- current S Store fields on `stores`;
- `s_store_status_history`;
- `s_store_sell_through`;
- `s_store_product_inventory_snapshots`;
- `s_store_material_inventory_snapshots`;
- `s_store_visit_details`;
- `s_store_replenishment_tasks`.

No Supabase migration was added in Task-039.

Task-051 documented the production alignment direction for Supabase S Store fields, dedicated S Store tables, indexes, constraints, RLS scope, API/RPC boundaries, and audit coverage.

Primary production-boundary reference:

- `23_S_STORE_SUPABASE_RLS_API_ALIGNMENT.md`

Task-052 added a confirmed additive migration draft:

- `supabase/migrations/20260718000100_s_store_schema.sql`

The migration draft covers:

- S Store current-state fields on `stores`;
- `s_store_status_history`;
- `s_store_sell_through`;
- `s_store_product_inventory_snapshots`;
- `s_store_material_inventory_snapshots`;
- `s_store_visit_details`;
- `s_store_replenishment_tasks`.

Contribution metrics should continue to aggregate from existing operational source tables instead of adding a manual contribution table in V1.

The migration file has not been executed against a remote Supabase project in Task-052. Production RLS policies remain a separate confirmed task.

## Required Database Principles

- Tables must have one clear owner module.
- Fan level uses lifetime growth points.
- Reward redemption deducts available points, not lifetime points.
- Reward redemption must record item, points cost, status, pickup/review state.
- Store verification must record operator, store, fan, activity/reward, time, result.
- Store level changes require before/after value and reason in audit logs.
- Material inventory must support Riyadh, Dammam, and Jeddah warehouses.
- Region permissions must be enforceable by data fields, not only UI hiding.
- S Store historical sell-through submissions should be read-only to stores after submission.
- Manager/Admin corrections to key S Store data should keep an audit trail.
- Low-stock detection for S Stores should compare current stock with target stock.

## Database Change Rule

Before any database change, the task must state:

1. Which table changes
2. Which field changes
3. Whether migration is needed
4. Whether seed data changes
5. Whether Supabase RLS changes
6. Whether local DB version changes
7. Whether existing data needs migration

No database change is allowed without user confirmation.
