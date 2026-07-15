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

## Warehouses

Initial warehouses:

- Riyadh
- Dammam
- Jeddah

Inventory must be tracked by warehouse. Total stock alone is not enough.

