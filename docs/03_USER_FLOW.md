# UWELL CRM User Flow

## Fan Flow

```text
Fan opens fan app
↓
Login / Register
↓
Home
↓
Daily Check-in / Scan / Activity / Store / Reward
↓
Earn points
↓
Level progress updates
↓
Redeem reward
↓
Store pickup or backend review
↓
Me: history, invite, old-fan verification, guide
```

## Fan Activity Verification Flow

```text
Fan joins store activity
↓
Fan visits store
↓
Fan shows member/activity QR
↓
Store scans QR in Verify
↓
System validates duplicate, time, store, activity, risk
↓
Points added or Pending Review
```

## Store Flow

```text
Store logs in
↓
Home workbench
↓
Verify fan / join campaign / upload photos / request materials
↓
Records sync to backend
↓
Backend reviews activity, photos, level, material request
↓
Store sees status and next action
```

## Field Rep Flow

```text
Rep logs in
↓
Dashboard / Field Visits
↓
New Store Visit or Repeat Visit
↓
Collect store basics, monthly sales, photos, display data
↓
Submit score and suggested level
↓
Manager/Admin reviews
↓
Final store level and audit record
```

## Manager/Admin Flow

```text
Backend login
↓
Dashboard
↓
Pending review queues
↓
Stores / Fans / Campaigns / Rewards / Scan Codes / Materials / Visits
↓
Review or configure
↓
Audit log records critical operations
```

## Cross-portal Closed Loops

| Loop | Fan | Store | Backend |
|---|---|---|---|
| Reward pickup | Redeem reward | Verify pickup | Rules, stock, audit |
| Store activity | Join/visit | Verify participation | Review activity and risk |
| Store level | Sees Featured/Recommended | Sees level/benefits | Reviews S/A/B/C |
| Materials | Indirect store experience | Requests/supports display | Warehouse and approvals |
| Scan code | Scans code | Optional event verification | Code batches and risk |

## Planned S Store Brand Growth Loop

```text
UWELL selects A-level stores with strong cooperation willingness
-> store becomes an S Store / UWELL Brand Store
-> UWELL supports display, training, materials, activities, and reward pickup
-> fans discover UWELL Brand Store, join Brand Store Events, scan products, and pick up rewards
-> S Store submits weekly/monthly sell-through and inventory
-> field rep visits S Store, checks display, collects market feedback, and handles replenishment
-> backend aggregates sell-through, inventory, fan contribution, field visit notes, and market signals
-> Manager/Admin adjusts S Store status, replenishment, support, activities, and future incentives
-> S Store sells more, fans trust more, and UWELL gains terminal brand control
```

S Store sell-through does not replace scan data, and scan data does not replace sell-through. They should be used together with inventory, reward pickup, activity verification, and field visit feedback.

## Planned Fan Growth Flow

```text
Fan earns Available points and Lifetime growth
-> Available points are spent on rewards
-> Lifetime growth raises Bronze / Silver / Gold / Diamond level
-> higher level unlocks better reward, activity, and S Store experience eligibility
-> activities and rewards guide fans toward UWELL Brand Stores
-> store verification, reward pickup, scan, and feedback create backend signals
-> backend adjusts points, rewards, activities, and store support
```

Reward redemption should not reduce membership level.

Fan activity should stay fresh through always-on activities, weekly/monthly activities, and launch/holiday campaigns.

## Planned Backend Governance Flow

```text
User, store, fan, or field rep creates important data
-> RBAC limits who can see and operate on it
-> system sends approval items to Reviews when needed
-> system sends suspicious behavior to Risk Center when detected
-> Manager/Admin makes decision
-> Audit Log records key decisions and changes
-> source business object updates
```
