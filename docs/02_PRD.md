# UWELL CRM PRD

## Scope

This PRD describes the first trial-ready version of UWELL CRM across Fan App, Store App, and Backend.

## Fan App

### Purpose

Increase fan activity, product scanning, store traffic, community participation, and reward redemption.

Fan growth should build long-term brand trust, not only short-term points collection. The planned fan growth and points economy direction is documented in `22_FAN_GROWTH_AND_POINTS_ECONOMY.md`.

### Core Modules

| Module | Purpose | Input | Output | Exceptions |
|---|---|---|---|---|
| Login/Register | Create fan account | Email, password, country, city, confirmations | Fan profile | Invalid email, missing consent |
| Home | Daily action hub | Fan data, points, activities, stores | Clear next actions | Missing profile should redirect to login, not technical error |
| Check-in | Daily active habit | Fan action | Points and check-in record | Duplicate check-in, network failure |
| Scan | UWELL code validation | QR/barcode/manual input | Scan record, points if eligible | Non-UWELL, duplicate, claimed, daily limit |
| Activities | Official and store campaigns | Task action, join, verification | Activity record, points/review state | Expired, duplicate, pending store verification |
| Community | Fan content and interaction | Posts, likes, comments | Community record, points within limits | Abuse, duplicate like, short comment |
| Rewards | Point mall | Reward selection | Redemption record, pickup/review state | Insufficient points, level lock, out of stock |
| Stores | Store map and discovery | Location/filter | Store list, navigation | No nearby store, location denied |
| Me | Account center | Fan profile | Histories, invite, guide, language | Missing profile, logout |

### Planned Fan Growth Enhancements

| Area | Direction |
|---|---|
| Points economy | Keep Available points for redemption and Lifetime growth for level; planned routine cap is 50 points/day |
| Membership journey | Keep Bronze/Silver/Gold/Diamond thresholds, but add identity and benefit meaning |
| Rewards | Separate Normal, Premium, Diamond/High-value, and Experience rewards |
| Activities | Separate always-on, weekly/monthly, and campaign/launch activities |
| Campaign freshness | Backend should support templates, scheduling, recommendation slots, and performance tracking in future work |

## Store App

### Purpose

Help stores execute UWELL operations quickly: verification, campaigns, photos, materials, and profile management.

### Core Modules

| Module | Purpose | Input | Output | Exceptions |
|---|---|---|---|---|
| Login/Register | Store access | Email/password or registration info | Store owner session | Review pending, invalid email |
| Home | Store workbench | Store status, tasks, metrics | Today actions | Missing store profile |
| Verify | Fan/reward/activity verification | Scan or manual code | Verification record | Invalid code, duplicate, no permission |
| Activities | Join UWELL campaigns or submit store events | Event form, campaign action | Pending/approved activity | Rejected, changes required |
| Photos | Storefront/display evidence | Photo upload | Review record | Missing photo, rejected photo |
| Materials | Request and status | Material request | Request record | No stock, region mismatch |
| Me | Store profile/settings | Store info | Profile, level, language | Incomplete profile |

### Planned S Store Report

S Stores are planned UWELL Brand Stores selected from A-level stores.

Only S Stores should see S Store reporting entry points.

| Module | Purpose | Input | Output | Exceptions |
|---|---|---|---|---|
| S Store Report | Submit terminal sell-through, product inventory, and material inventory | Weekly/monthly open-system and disposable sales, current stock, target stock, material quantity | Locked reporting records synced to backend | Non-S stores cannot access, historical records are read-only, invalid period |

## Backend

### Purpose

Operate the whole system: users, stores, fans, campaigns, rewards, scan codes, materials, visits, reviews, risks, and settings.

### Core Modules

| Module | Purpose |
|---|---|
| Dashboard | Segmented overview and pending work |
| Stores | Store list, level review, display review, exposure control |
| Fans | Fan list, levels, points, community, old-fan verification |
| Campaigns | Official campaigns, store event review, activity rules |
| Rewards | Reward catalog, redemption records, high-value review |
| Scan Codes | Unique codes, campaign codes, scan records, suspicious scans |
| Materials | Materials, warehouses, stocks, inbound/outbound, requests |
| Field Visits | New/repeat visits, rating evidence, display data |
| Reviews | Unified approval center |
| Risk Center | Abnormal behavior detection |
| Settings | Users, products, data, audit |

### Planned Backend Governance V1

Backend Governance V1 is documented in `21_BACKEND_GOVERNANCE_V1_PLAN.md`.

V1 direction:

- RBAC and data scope first;
- Audit Log second;
- Reviews V1 for the six highest-impact review types;
- Risk Center V1 for scan, points, reward, and S Store data risks;
- connect governance to S Store and Fan Growth.

### Planned S Store Management

S Store Management should live under Backend > Stores.

It should aggregate S Store basic info, cooperation status, sell-through, inventory, material inventory, field visit notes, display photos, activity contribution, reward pickup contribution, replenishment follow-up, and downgrade/restore history.

The first S Store overview should focus on Active S Stores, new/downgraded S Stores, low-stock S Stores, weekly/monthly open-system and disposable sales, replenishment status, Brand Store event verifications, and reward pickups at S Stores.

### Planned S Store Visit Template

Field Visits should support an S Store visit template for terminal market feedback.

It should record inventory, display, sell-through observation, competitors, hot brands, hot flavors, consumer feedback, market notes, support needed, replenishment needs, and photos.

## Current Known Gap

The current implementation has many business modules, but UI, information hierarchy, and product flow are not yet aligned with the confirmed product direction. Future work must upgrade existing functions instead of replacing them with disconnected preview logic.
