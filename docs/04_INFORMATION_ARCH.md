# UWELL CRM Information Architecture

## Fan App IA

Main navigation must be fixed at bottom:

1. Home
2. Activities
3. Community
4. Rewards
5. Stores
6. Me

### Home

- Member growth card
- Daily Check-in
- Scan UWELL Code
- Join Activity
- Recommended activity
- Recommended reward
- Nearby/recommended store

### Activities

- Top quick point tasks: read, like, comment, share where applicable
- Official activities
- Store activities
- Store activities empty state when none
- Activity detail with back button

### Community

- Publish post entry
- Official posts
- Fan posts
- Likes/comments
- Light points rule hint only

### Rewards

- Category/grid mall layout
- Reward image slots
- Available / locked / review-required states
- Redemption history accessible from Me
- Reward tiers should be understandable: Normal, Premium, Diamond / High-value, Experience.

### Stores

- Map
- Nearby stores
- S/A featured/recommended stores
- B/C normal listing
- Filters: Nearby, Featured, Activities, Reward pickup
- Store detail with navigation

### Me

- Profile and level
- Available points and lifetime points
- Points history
- Reward history
- Activity history
- Scan history
- Invite friends
- Old fan verification
- New user guide
- Language

### Planned Fan Growth Layer

Fan IA should support a membership journey:

- Available points for redemption;
- Lifetime growth for level;
- Bronze / Silver / Gold / Diamond identity;
- growth tasks that guide real brand actions;
- reward tiers by membership and cost level;
- activity freshness through always-on, weekly/monthly, and campaign/launch activities.

Activities should not feel like a static task list. Backend campaign operations should eventually support templates, scheduling, and recommendation slots.

## Store App IA

Fixed bottom navigation:

1. Home
2. Verify
3. Activities
4. Me

Display upload is not primary navigation. It appears in Home setup task and Me.

## Backend IA

Recommended main navigation:

1. Dashboard
2. Stores
3. Fans
4. Campaigns
5. Rewards
6. Scan Codes
7. Materials
8. Field Visits
9. Reviews
10. Risk Center
11. Settings

### Planned Backend Governance IA

Backend governance should keep Reviews, Risk Center, and Audit Log conceptually separate:

- Reviews: unified approval queue;
- Risk Center: anomaly and risk event center;
- Audit Log: critical operation history;
- Settings / Users: RBAC and account management.

Reviews V1 should focus on store registration/profile, store level/S Store status, store photo, store activity, high-value reward, and old fan verification.

Risk Center V1 should focus on scan, points, reward, and S Store data risks.

### Planned Stores Sub-navigation

Stores should include S Store management as a future sub-module:

1. Store List
2. Store Detail
3. Store Level Review
4. Display / Photo Review
5. S Store Management

S Store Management should include:

- S Store Overview
- S Store List
- S Store Detail

It should not replace the normal store list. It is a focused management area for UWELL Brand Stores.

## Planned Fan S Store Presentation

Fan-facing S Stores should be shown as `UWELL Brand Store`, not as an internal S-level explanation.

Suggested fan-facing labels:

| Backend level | Fan-facing label |
|---|---|
| S | UWELL Brand Store |
| A | Recommended Store |
| B/C | Store |

Stores, rewards, and activities can use this label to guide fans toward trusted brand-store experiences.

## Duplicate Function Rule

If one function appears in two places, one must be primary and one must be an entry shortcut.

Example:

- Reward redemption primary location: Fan Rewards.
- Reward history secondary location: Fan Me.
- Store photo upload primary location: Store Me / Store Profile.
- Store Home may show a reminder shortcut only.
