# Fan Store Visit Task Closure · 2026-07-07

## Decision

The fan "Visit a verified store" task should be closed by S-level store verification, not by fan self-reporting alone.

Fans can use the task to find a nearby S-level store. After arriving, the fan shows a one-time visit code in Fan Center. The S-level store enters or scans that code in Store Portal. When verification succeeds, the fan receives visit points and the store receives a service record.

## Why This Flow

- It prevents fake check-ins and repeated self-submitted photos.
- It gives S-level stores a clear service responsibility.
- It creates auditable records for fan growth, campaign participation, and store performance.
- It matches the reward pickup model: fan generates code, S-level store verifies, system records the close.

## User Flow

1. Fan opens Fan Center > Tasks > Visit a verified store.
2. Fan sees nearby eligible S-level stores.
3. Fan taps Generate visit code.
4. Fan arrives at the store and shows the code.
5. Store opens Store Portal > Fan Visit Verification.
6. Store inputs or scans the code.
7. System checks:
   - code exists and is not expired,
   - code is not already used,
   - store level is S,
   - store is within the eligible campaign/city scope if a campaign requires it.
8. System marks the task completed, adds fan points, and records store service credit.

## Store Evidence

Store photo proof should be optional by default and required only for campaigns that need stronger audit evidence.

Recommended evidence levels:

- Normal task: store verification code only.
- Campaign task: store verification code plus optional shelf/display photo.
- High-value reward or dispute: store verification code plus required photo and admin review.

## Points And Rewards

- Fan reward: +20 points for a verified S-level store visit, once per day.
- Store reward: one service credit per verified fan visit.
- Abuse rule: same fan and same store can only create one successful visit verification per day.
- Store ranking: monthly service credits can feed S-level maintenance, campaign bonuses, and POSM priority.

## S-Level Store Responsibilities

- Verify fan visit codes promptly.
- Explain active UWELL activities and reward pickup rules.
- Keep reward pickup and visit verification records accurate.
- Maintain display quality and stock visibility for campaign items.
- Cooperate with random audit requests when campaign rewards are involved.

## S-Level Store Incentives

- Monthly S-level service score from fan visit verifications.
- Priority for campaign materials and display upgrade support.
- Eligibility for store bonus rewards when verified visits convert into scans or redemptions.
- Higher visibility in Fan Center store recommendations.

## Data Needed For Implementation

New table: `fan_store_visit_codes`

Core fields:

- `id`
- `fan_id`
- `target_store_id`
- `code`
- `status`: `active`, `verified`, `expired`, `cancelled`
- `points`
- `expires_at`
- `created_at`
- `verified_at`
- `verified_by_store_id`
- `verification_photo_url`
- `campaign_id`

Store Portal action:

- `verifyFanStoreVisit(code, storeId, photoUrl?)`

Fan Portal action:

- `createFanStoreVisitCode(fanId, targetStoreId, campaignId?)`

## Open Before Build

- Confirm whether fan visit points are +20 or another amount.
- Confirm whether all S-level stores can verify all fan visit codes, or only the selected target store can verify.
- Confirm whether campaign visit tasks require photo proof by default.
