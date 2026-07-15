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

