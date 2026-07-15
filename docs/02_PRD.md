# UWELL CRM PRD

## Scope

This PRD describes the first trial-ready version of UWELL CRM across Fan App, Store App, and Backend.

## Fan App

### Purpose

Increase fan activity, product scanning, store traffic, community participation, and reward redemption.

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

## Current Known Gap

The current implementation has many business modules, but UI, information hierarchy, and product flow are not yet aligned with the confirmed product direction. Future work must upgrade existing functions instead of replacing them with disconnected preview logic.

