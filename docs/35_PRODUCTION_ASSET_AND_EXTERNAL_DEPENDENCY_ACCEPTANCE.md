# UWELL CRM Production Asset And External Dependency Acceptance

Date: 2026-07-29

Task: Task-157

Status: asset and external dependency inventory. No asset download, replacement, compression, runtime code change, database change, API change, permission change, `.env` change, dependency install, or business-rule change.

## Purpose

Task-157 inventories critical production-facing assets and external dependencies so trial operators know which visuals and third-party services can affect demo quality or wider external trial stability.

This task does not verify live external URL availability and does not replace any asset. It records what must be accepted before wider external trial or production launch.

## Source Scan Summary

Scanned:

1. `frontend/src`
2. `frontend/public`
3. `frontend/index.html`
4. `frontend/fan-app.html`
5. `frontend/store-app.html`

Local asset footprint found:

| Location | Asset count | Approx total size |
|---|---:|---:|
| `frontend/public/uwell-assets` | 71 | 33.16 MB |
| `frontend/src/assets` and `frontend/public/images` | 33 | 7.13 MB |

External host references found in source scan:

| Host | Approx references | Main use |
|---|---:|---|
| `maps.app.goo.gl` | 77 | Seed/demo store address links |
| `files.myuwell.com` | 27 | UWELL official product images/videos |
| `images.unsplash.com` | 11 | Non-critical placeholder/editorial imagery in legacy or preview surfaces |
| `www.instagram.com` | 4 | Fan activity/social links |
| `www.google.com` | 4 | Google Maps directions/search links |
| `cdnjs.cloudflare.com` | 3 | Leaflet marker icons in Fan Stores map |
| `unpkg.com` | 3 | Leaflet marker icons in Admin Dashboard map |
| `d8j0ntlcm91z4.cloudfront.net` | 2 | Fan Center background video |
| `fonts.googleapis.com` / `fonts.gstatic.com` | present | Google Fonts loaded by entry HTML |
| `tile.openstreetmap.org` | present | Leaflet map tiles |
| `www.myuwell.com` | 3 | Official UWELL site/news links |

## Critical Asset Classification

### P0: Must Be Stable Before Wider External Trial

| Area | Asset/dependency | Current state | Risk | Required acceptance |
|---|---|---|---|---|
| Fan Home first impression | CloudFront background video and UWELL official product media | External video plus `files.myuwell.com` product media | If blocked/slow, the first viewport can lose product atmosphere or show blank media | Confirm video and hero image load in external preview; define static image fallback |
| Fan product/activities | `files.myuwell.com` official banners and product images | External official assets | Official CDN path may change or be blocked by region/network | Keep local fallback candidates or decide CDN risk is acceptable for trial |
| Fan Rewards proof | `/uwell-assets/rewards/*` | Local project assets | Good local resilience; source/license/status still needs handoff note | Confirm all reward images render and are approved for trial presentation |
| Fan Stores/Community/Me visuals | `/uwell-assets/fan-refresh-v2/*` | Local project assets | Good availability; large local asset footprint | Confirm no broken images and no accidental raw/placeholder asset appears in final walkthrough |
| Maps | OpenStreetMap tiles, Leaflet marker icons from CDN, Google Maps direction links | External map services | Tiles/icons/directions depend on network and third-party policy | Map view must degrade gracefully; store list/details must remain usable without map tiles |
| Fonts | Google Fonts for Instrument Serif, Barlow, Inter | External CSS/font files | Slow or blocked fonts can cause fallback rendering and screenshot wait delays | Ensure system font fallback is acceptable; do not make fonts a route blocker |
| PWA/service worker | `/manifest.json`, `/sw.js`, icons | Local | Stale cache can hide current assets during local/demo | Confirm production cache version and asset update behavior before public launch |

### P1: Should Be Accepted Before Production Launch

| Area | Asset/dependency | Current state | Risk | Required acceptance |
|---|---|---|---|---|
| Store App profile/photos | Storefront/display uploaded photo surfaces | Mostly data-driven/local demo surfaces | Real upload/storage path may differ from local demo | Confirm preview storage bucket and fallback empty states |
| Admin Dashboard map | Leaflet tiles and marker icons | External map tiles/icons | Admin map is useful but not the only operational proof | Confirm dashboard remains useful if map tiles fail |
| Official/social links | myuwell.com and instagram.com | External links | Link changes do not break app routes but affect trust | Confirm links open in new tab and are correct for trial market |
| Legacy/preview imagery | Unsplash references | Existing source references outside current main route scope | Can look off-brand if exposed | Do not use legacy/preview pages as trial source; classify any visible Unsplash asset before external demo |

### P2: Can Be Hardened During Trial

| Area | Asset/dependency | Current state | Risk | Required acceptance |
|---|---|---|---|---|
| Local asset size | `public/uwell-assets` about 33 MB | Good resilience, larger build/static footprint | Slower first install/cache on constrained networks | Later image compression and unused asset cleanup plan |
| Duplicated fan-refresh assets | `fan-refresh` and `fan-refresh-v2` both exist | Current code mainly references `fan-refresh-v2` | Maintenance confusion | Later cleanup only after confirming no route references old set |
| Product bubble assets | `src/assets/products/caliburn-bubble-*.png` | Bundled with app | Large images appear in build output | Later size optimization if performance requires |

## Recommended Fallback Strategy

### Keep Local

Keep these as local project assets for trial stability:

1. Fan Rewards reward images.
2. Fan Stores/Community/Me proof images.
3. Fan Entry product bubble assets.
4. Admin hero image.
5. App icons and manifest icons.

### Add Fallback Decision Before External Trial

For these, the business/technical owner must choose one of two options:

| Dependency | Option A | Option B |
|---|---|---|
| CloudFront Fan Center video | Accept as external atmosphere only; static fallback is required | Replace with local approved video in a separate confirmed asset task |
| `files.myuwell.com` official product media | Keep official CDN and accept outage risk | Mirror approved critical assets locally after confirming source rights |
| OpenStreetMap tiles | Keep map as progressive enhancement | Add clear list-first fallback state when tiles fail |
| Leaflet marker icons from CDN | Keep CDN marker icons | Copy marker icons locally in a separate confirmed asset task |
| Google Fonts | Keep external font loading with system fallback | Self-host fonts only after separate confirmation |

## Acceptance Checklist

Before wider external trial:

1. Fan Home renders a product/brand visual even if video is blocked.
2. Fan Rewards images render with no broken image icons.
3. Fan Stores/Map remains usable if map tiles or marker icons fail.
4. Community/Me local images render and look intentional.
5. Store profile/photo missing states remain professional.
6. Admin Dashboard remains useful if map tiles fail.
7. Google Fonts fallback does not break layout or readability.
8. Official links are reviewed for correct destination and market relevance.
9. No preview-only or Unsplash placeholder imagery appears in the controlled demo path.
10. Latest browser QA records visible broken images total `0`.

## Stop Conditions

Stop wider external trial if:

1. Fan Home first viewport shows blank/blocked primary media with no fallback.
2. Reward or product proof media is broken.
3. Map failure blocks store discovery or backend operations instead of degrading.
4. A preview/placeholder/stock-like image appears in the official trial path.
5. A service worker serves stale outdated assets after a new build.
6. External media failure creates console/page errors that break route interaction.

## Current Decision

Task-157 closes the inventory and strategy gap, but not the live external-asset acceptance gap.

Current launch stance after Task-157:

1. Local internal trial: Go.
2. Controlled demo walkthrough: Go.
3. Wider external preview trial: Conditional Go, because Task-155 fallback-disabled remote browser QA was skipped and live external-asset verification was not executed in Task-157.
4. Production launch: No-go until remote acceptance, named owner assignments, and live external asset/media acceptance are completed.

## Recommended Next Task

Task-158: Trial Handoff Package And Final Go/No-go Summary.

Scope:

1. Combine Task-151 local QA, Task-154 runbook, Task-155 skipped/preflight note, Task-156 owner matrix, and Task-157 asset inventory into one handoff package.
2. Produce a single trial-readiness decision table for internal trial, controlled demo, external preview, and production launch.
3. Do not change code, assets, `.env`, database, API, permissions, or dependencies.
