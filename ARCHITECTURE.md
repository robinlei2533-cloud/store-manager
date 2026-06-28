# UWELL MEA · Market Growth Operating System

## Architecture Overview

### User Roles
| Role | Permissions |
|---|---|
| admin | Full system access |
| manager | View all data, approve materials |
| rep | Create visits, rate stores, edit materials |
| store_owner | Own store dashboard, fans, redemptions |
| fan | Checkin, scan, lottery, mall, community |

### Modules
1. Fan Growth Engine (checkin/scan/levels/points/achievements)
2. Store Ops Center (stores/visits/evaluations/materials)
3. Campaign Platform (create/assign/report)
4. Growth Dashboard (stats/charts/trends)
5. Community (forum/share/questions)

### Data Flow
scanned QR → fan registration → points accumulation → level up → redeem rewards → revisit store

### Tech Stack
- Frontend: React 19 + Vite 8 + Ant Design 6 + React Query 5
- State: Zustand 5
- Database: Supabase (current fallback: localStorage via localDb.js)
- 26 tables, seed data in src/services/db/seedData.js

### Routes
- /#/ - Fan entry redirect
- /#/fan-center - Fan center
- /#/admin - Admin login
- /#/app/* - Admin panel (role-based)

### API (to be implemented)
REST endpoints for fans, stores, visits, evaluations, campaigns, materials, dashboard
See full API design in Sprint 4 docs.
