# UWELL CRM RBAC Specification

## Roles

| Role | Scope |
|---|---|
| Admin | All regions, all warehouses, all users, all reviews, all rules |
| Manager | Assigned regions, regional reviews, regional operations |
| Field Rep | Assigned region/stores, visit execution, own submissions |
| Store Owner | Own store data and store operations |
| Fan | Own fan account and activity data |

## Backend Account Creation

- Backend login page must only show login.
- Public backend registration is forbidden.
- Only Admin can create Manager and Field Rep accounts.
- Manager cannot create accounts.
- Field Rep cannot create accounts.

## Admin

Can:

- Manage users
- Manage rules
- Manage scan codes
- Manage rewards
- Approve high-value rewards
- Review and change store levels
- Manage all warehouses
- View all audit logs

## Manager

Can:

- View assigned-region dashboard data
- Review assigned-region stores, visits, photos, campaigns, rewards, materials
- View assigned-region warehouse inventory
- Approve/reject assigned-region operational reviews if allowed

Cannot:

- Create Manager or Field Rep accounts
- View unrelated regions
- Modify global rules unless explicitly approved

## Field Rep

Can:

- Create new store visit
- Create repeat visit
- Submit display data
- Submit suggested store rating
- View assigned-region warehouse availability
- Submit material needs

Cannot:

- Set final store level
- Approve material requests
- Modify inventory
- Give fan points manually
- Create accounts
- Manage global rules

## Store Owner

Can:

- Manage own store profile
- Upload store front/display photos
- Verify fan activity participation
- Verify reward pickup if store level qualifies
- Submit store-created campaigns
- Request materials

Cannot:

- Give arbitrary points
- Change fan level
- Change reward rules
- Approve high-value rewards
- Access other stores

## Fan

Can:

- View and update own profile
- Check in
- Scan eligible codes
- Join activities
- Post/comment/like
- Redeem eligible rewards
- View own histories

Cannot:

- Access other fans' data
- Manually change points
- Bypass level/reward rules

## Region Permission Rule

Region access applies to:

- Dashboard
- Stores
- Field visits
- Materials
- Material requests
- Inventory alerts
- Reviews
- Audit logs

