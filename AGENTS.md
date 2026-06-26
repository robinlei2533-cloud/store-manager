# UWELL CRM · Project Snapshot

## Location
C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm\frontend

## Server
http://localhost:5173 (Python HTTP Server, dist/)

## Build Status (Latest)
vite build: SUCCESS (3721 modules, ~2.3MB)

## Pages
| URL | Description |
|---|---|
| / | Auto-redirect (fan-center if logged in, else fan-entry.html) |
| /fan-entry.html | Fan login page (particles, product drops, 12 Uwell products) |
| /#/fan-center | Fan Center (CheckIn/Scan/Rewards/Invite/Community/Help) |
| /#/store-owner | Store Owner Dashboard (Store Info, Fans list, Scans) |
| /#/admin | Admin Login |
| /#/app/dashboard | Admin Dashboard (role-based sidebar) |

## Role Permissions (AppLayout sidebar)
- admin: full access (stores, visits, eval, campaigns, materials, fan-ops, settings)
- manager: same as admin minus settings
- rep: visits, evaluation, materials only

## Fan Center Tabs
1. CheckIn - daily check-in with streak tracking +5 pts
2. Scan - QR code scan (limit 3/day) +5 pts each
3. Rewards - Mall items redeemable with points
4. Invite - Referral code + invite tracking
5. Community - Posts with likes
6. Help - FAQ

## Key Files
- src/App.jsx - Routes (hash router)
- src/pages/fans/FanCenterPage.jsx - Fan center (6 tabs)
- src/pages/store-owner/StoreOwnerPage.jsx - Store owner (3 tabs)
- src/components/layout/AppLayout.jsx - Role-based sidebar
- src/services/db/localDb.js - localStorage engine
- src/services/db/seedData.js - 26 tables seed data
- public/fan-entry.html - Fan login with particles + products
- src/stores/authStore.js - Auth state (local mode)

## Build
cd "C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm\frontend" && npx vite build
