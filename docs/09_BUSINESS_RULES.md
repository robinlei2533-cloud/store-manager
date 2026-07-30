# UWELL CRM Business Rules

## Fixed System Logic

These rules are not normal admin settings:

- Reward redemption deducts Available points.
- Reward redemption does not deduct Lifetime growth points.
- Fan level is based on Lifetime growth points.
- Redeeming rewards never downgrades fan level.
- Stores cannot manually give points.
- Stores verify participation or pickup; the system awards points.
- One unique UWELL product code can only be claimed once.
- Same fan cannot earn duplicate points from the same activity.
- Backend login has no public registration.
- Only Admin can create Manager and Field Rep accounts.
- Region-based access control is mandatory.
- Critical operations write Audit Log records.

## Planned Backend Governance Rules

Backend Governance V1 should be implemented in this order:

1. RBAC and data scope.
2. Audit Log service.
3. Reviews V1.
4. Risk Center V1.
5. Connect governance to S Store and Fan Growth.

Reviews V1 should include:

- store registration / profile review;
- store level change / S Store status change;
- store display / photo review;
- store-created activity review;
- high-value reward redemption review;
- old fan verification.

Risk Center V1 should include:

- scan risk;
- points risk;
- reward risk;
- S Store data risk.

Audit Log V1 should record key permission, rule, review, risk, store level, S Store, reward, points, material, and inventory operations.

## Configurable Operational Parameters

Admin can configure:

- Scan points
- Daily scan counted limit
- Check-in points
- Community like/comment/post points and daily limits
- Fan level thresholds
- Reward point costs
- Reward level requirements
- Reward stock
- Campaign reward points
- Campaign time range
- Eligible stores
- Material low-stock thresholds
- High-value reward review threshold

## Fan Level Rules

| Level | Lifetime growth points |
|---|---:|
| Bronze | 0 |
| Silver | 300 |
| Gold | 1000 |
| Diamond | 5000 |

Premium rewards may require 10000+ points without creating a new level.

## Point Rules

| Action | Initial Rule |
|---|---|
| Daily check-in | +5 |
| UWELL unique product scan | +5, counted up to 3/day |
| Official article/website task | +5 |
| Instagram viewing task | +5 |
| Like/comment/share official task | +10 |
| Store event check-in | +20 to +100, configured per event |
| Invite friend registration | +50 when active |
| Old fan verification | +100 when approved |
| Community like | +1, up to 10/day |
| Community comment | +2, up to 5/day |
| Community post/share | +10, first valid post/day |

## Planned Points Economy Rules

UWELL should keep two point concepts:

- Available points: spendable points for reward redemption.
- Lifetime growth: accumulated growth score for membership level.

Reward redemption deducts Available points and does not deduct Lifetime growth.

Planned routine cap:

```text
Daily routine cap = 50 points/day
```

Included in routine cap:

- check-in;
- scan counted points;
- community like/comment/post;
- official light tasks.

Not included in routine cap:

- store activity rewards;
- invite rewards;
- old fan verification;
- backend-approved compensation;
- special campaign rewards.

Category caps:

| Action | Planned cap |
|---|---|
| Check-in | 1/day |
| Scan counted points | 3/day |
| Community like | 10/day |
| Community comment | 5/day |
| Community post/share | 1/day |
| Store activity | 1 time per activity per fan |
| Invite | 1 time per valid invited fan |
| Old fan verification | 1 time per fan |

## Scan Code Rules

- Product codes are globally unique.
- First valid claim earns points.
- Same fan rescanning same code earns no points.
- Another fan scanning a claimed code earns no points and creates suspicious record.
- Each fan can earn product scan points at most 3 times/day.
- Recognition can continue after daily limit, but points are not awarded.
- Non-UWELL codes do not grant points.

## Reward Rules

- Reward catalog is configurable.
- Redemption logic is fixed.
- Normal rewards: A/S stores can fulfill.
- Premium rewards: S stores only.
- Diamond/high-value rewards require backend review.
- Luxury rewards must not auto-approve in first version.
- Fan app should show locked rewards instead of hiding them.

Planned reward tiers:

| Reward tier | Purpose |
|---|---|
| Normal | Make points useful for new and regular fans |
| Premium | Encourage level growth and S Store visits |
| Diamond / High-value | Build high-trust and VIP brand feeling |
| Experience | Strengthen product and brand experience |

High-value rewards must require review and should not auto-approve.

## Planned Membership Journey

The existing level thresholds remain:

| Level | Lifetime growth points | Fan identity |
|---|---:|---|
| Bronze | 0 | New fan |
| Silver | 300 | Active fan |
| Gold | 1000 | Core fan |
| Diamond | 5000 | VIP fan |

Membership benefits should emphasize access, priority, experience, and identity rather than only physical gifts.

## Planned Activity Freshness Rules

Fan activities should include:

- always-on activities;
- weekly/monthly activities;
- campaign/launch activities.

Suggested operating rhythm:

```text
Daily: always-on tasks
Weekly: at least one light activity
Monthly: at least one key activity
Launch/holiday: special campaign activity
```

Store-created activities still require review before fan-facing exposure.

## Store Rating Rules

100-point model:

| Dimension | Points |
|---|---:|
| Monthly sales | 20 |
| Location / traffic | 15 |
| Store front / signboard image | 10 |
| UWELL display quality | 15 |
| Product coverage | 15 |
| Staff cooperation | 10 |
| Campaign readiness | 10 |
| Photo / data completeness | 5 |

Suggested level:

| Score | Suggested level |
|---:|---|
| 90-100 | S |
| 75-89 | A |
| 60-74 | B |
| Below 60 | C |

Field Rep submits score. Manager reviews. Admin confirms or adjusts final level with reason and audit log.

## Planned S Store Rules

S Store means **UWELL Brand Store**.

An S Store is selected from A-level stores. It is a strategic brand cooperation store, not only a high-score store.

S Store selection standard:

- must first be an A-level store;
- owner has strong cooperation willingness;
- store is willing to recommend UWELL products;
- store is willing to cooperate with sell-through, inventory, field visits, reward pickup, and brand activities;
- renovation, display, sales foundation, and training can be improved later with UWELL support.

S Store sell-through first version:

- weekly open-system sold quantity;
- weekly disposable sold quantity;
- monthly open-system sold quantity;
- monthly disposable sold quantity.

Store-submitted historical sell-through records are locked after submission. Corrections are handled by backend users with audit trail.

S Store low-stock rule:

```text
current stock <= target stock / 3
```

S Store downgrade rule:

An S Store can be directly downgraded to A when any of the following occurs:

- UWELL products are out of stock for more than one month;
- the store is unreachable for more than one month;
- owner cooperation attitude clearly declines;
- the store no longer wants to act as a UWELL Brand Store.

S Store restoration rule:

- downgraded S Store returns to A;
- it can reapply or be re-evaluated later;
- restoration uses the same S Store selection standard;
- at least one natural month of observation is recommended;
- downgrade and restoration records must keep reason, operator, time, before/after status, and notes.

## Warehouses

Initial warehouses:

- Riyadh
- Dammam
- Jeddah

Inventory must be tracked by warehouse. Total stock alone is not enough.
