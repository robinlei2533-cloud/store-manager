# UWELL CRM Database Specification

## Current Data Strategy

The project currently uses two data layers:

1. Local trial database in `frontend/src/services/db/localDb.js`
2. Supabase migrations in `supabase/migrations`

Local DB is useful for demos and local fallback. Supabase is the production direction.

## Local DB Version

Current local DB version: `5.9`

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
| audit_logs | Critical operation records |
| auth | Local trial auth records |

## Required Database Principles

- Tables must have one clear owner module.
- Fan level uses lifetime growth points.
- Reward redemption deducts available points, not lifetime points.
- Reward redemption must record item, points cost, status, pickup/review state.
- Store verification must record operator, store, fan, activity/reward, time, result.
- Store level changes require before/after value and reason in audit logs.
- Material inventory must support Riyadh, Dammam, and Jeddah warehouses.
- Region permissions must be enforceable by data fields, not only UI hiding.

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

