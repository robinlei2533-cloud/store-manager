# Store Auth and S-Level Reward Redemption Design

Date: 2026-07-06

## Goal

Move the Store portal and Fan reward flow from demo-style access into a controlled trial workflow:

- Store owners use email and password as the primary login method.
- Store registration no longer requires a contact person field.
- Fan rewards are redeemed in person through S-level stores only.
- Store reward pickup deducts store reward inventory and creates an auditable record.
- The recurring modal/form readability issues on secondary and tertiary pages are handled as a separate UI hardening phase after the business flow is approved.

## Current Context

The Store login page currently supports an email/password path internally, but the UI still presents mixed placeholders: `Store ID or owner email` and `Phone or password`. The registration form requires `Contact person`, `Phone`, `Country`, and `City`.

The Fan Rewards tab currently deducts points and generates a redemption code in the client/local data layer. It does not yet provide:

- code status tracking;
- S-level store-only pickup validation;
- store-side code lookup;
- store inventory deduction;
- admin exception handling.

The Material modal screenshot shows a separate but related UI problem: Ant Design modals, selects, and form surfaces in deeper pages can inherit dark shell styling and become unreadable. This should be fixed systematically, but it should not be mixed into the reward business logic.

## Decisions

1. Only S-level stores may validate and fulfill fan reward pickup in the first release.
2. Store owner login uses email and password.
3. Store registration asks for owner email and password.
4. Contact person is optional or removed from the public registration UI. The first implementation should remove it from required validation and hide it unless the existing data model needs it for backward compatibility.
5. Phone remains required for Store registration in the first implementation because it supports manual review and field-rep follow-up.
6. Strict Supabase RLS remains the target for external preview. Public Store registration must not rely on anonymous direct table writes.

## Recommended Approach

Use a controlled Store registration path plus a Store-center reward pickup tool.

Store registration should submit to a controlled backend path, such as a Supabase Edge Function or equivalent trusted API. That backend creates or links:

- Supabase Auth user;
- `profiles` row with role `store_owner`;
- `stores` row in `pending_review` status;
- `stores.owner_profile_id` binding.

Reward redemption should be a two-step process:

1. Fan creates a pending pickup redemption by spending points.
2. S-level store confirms pickup by entering the code.

This keeps fan intent, store fulfillment, inventory movement, and admin audit as separate events.

## Store Entry Design

### Login

Fields:

- Email
- Password

Behavior:

- Submit through the existing auth sign-in path.
- After login, load stores where `owner_profile_id` matches the signed-in user.
- If no bound store exists, show a clear review/status message instead of falling back to another store.
- Preserve the old Store ID / phone local-demo login only behind local fallback rules, not as the primary preview UI.

### Registration

Fields:

- Store name: required
- Owner email: required
- Password: required
- Phone: required
- Country: required
- City: required
- Address or Google Maps link: optional

Removed or optional:

- Contact person

Behavior:

- Submit creates a pending Store-owner account and pending Store record.
- The Store owner sees a pending-review Store Center state after registration.
- Admin or Manager approves the store before it becomes active.
- Store level starts as `C` unless Admin assigns another level.

### Validation

- Email must be syntactically valid.
- Password must meet the app's minimum preview requirement.
- Country and city must pass the existing country/city validation.
- Duplicate owner email should show a useful "account already exists" message.
- Duplicate phone should be allowed only if Admin confirms it later, because some chain stores may share contact numbers.

## Fan Reward Redemption Design

### Fan Flow

1. Fan opens Rewards.
2. Fan selects a reward.
3. System checks points and reward availability.
4. Fan clicks Redeem.
5. System deducts points and creates a redemption record with status `pending_pickup`.
6. Fan sees a modal with:
   - reward name;
   - redemption code;
   - expiration date;
   - instruction to pick up from an S-level UWELL store.
7. Fan can revisit active redemption codes from Rewards history.

### Store Flow

Add a Store Center tab or dashboard action named `Reward Pickup`.

Fields:

- Redemption code input

Lookup result:

- reward name;
- fan display name or masked phone/email;
- points spent;
- expiration status;
- current store reward stock;
- pickup eligibility.

Confirm action:

- `Confirm Pickup`

Validation:

- code exists;
- code status is `pending_pickup`;
- code is not expired;
- current store level is `S`;
- current store has enough reward inventory;
- current store owner is bound to the signed-in Store profile.

Success behavior:

- mark redemption as `picked_up`;
- save `pickup_store_id`;
- save `picked_up_at`;
- save `picked_up_by`;
- decrement store reward inventory;
- create an inventory movement record linked to the redemption code.

Failure behavior:

- invalid code: show "Code not found";
- used code: show pickup store and pickup time if allowed;
- expired code: show "Code expired";
- non-S store: show "Only S-level UWELL stores can fulfill rewards";
- insufficient stock: show "Reward stock is not enough. Request replenishment."

## Data Model Changes

Extend or normalize `mall_redemptions`:

- `id`
- `fan_id`
- `item_id`
- `item_name`
- `points_cost`
- `redeem_code`
- `status`: `pending_pickup`, `picked_up`, `expired`, `cancelled`
- `expires_at`
- `pickup_store_id`
- `picked_up_at`
- `picked_up_by`
- `created_at`
- `updated_at`

Add or reuse store reward inventory:

- `store_id`
- `item_id`
- `item_name`
- `quantity_on_hand`
- `safety_stock`
- `updated_at`

Add inventory movement records for reward pickup:

- `store_id`
- `item_id`
- `movement_type`: `reward_redemption`
- `quantity`: negative number
- `redemption_id`
- `redeem_code`
- `created_by`
- `created_at`

The first implementation may use existing `material_stocks` or material movement tables if they already fit the inventory model. If reward items and marketing materials are too different in the current schema, create a focused reward inventory table instead of overloading unrelated material fields.

## Store Level Rules

| Level | Reward pickup | Responsibilities | Benefits |
|---|---:|---|---|
| S | Yes | Maintain reward inventory, fulfill valid codes, keep strong display standards, support fan traffic, participate in priority campaigns. | Higher material quota, priority campaign access, map/recommendation priority, pickup performance credit, possible rebate or reward settlement. |
| A | No in first release | Maintain display, participate in campaigns, request upgrade to S when standards are met. | Medium material quota, upgrade path, selected campaign access. |
| B | No | Basic display and sales follow-up. | Basic material support and field-rep coaching. |
| C | No | Trial or developing store status. | Entry-level support and evaluation path. |
| D | No | Prospect or inactive store. | No reward pickup. |

## Admin and Manager Operations

Admin and Manager should be able to:

- approve Store registrations;
- assign or change Store level;
- view all reward redemptions;
- filter by status, reward item, store, fan, and date;
- manually cancel an unused redemption;
- mark expired redemptions;
- review low reward stock at S-level stores;
- approve replenishment to S-level stores.

Field reps should be able to:

- see reward pickup performance for assigned stores;
- see low-stock warnings for assigned S stores;
- help stores request replenishment.

Field reps should not be able to validate a fan pickup unless they are explicitly acting through an authorized Store flow.

## RLS and Permission Design

Fan:

- can create own redemptions;
- can read own redemptions;
- cannot mark a redemption as picked up.

S-level Store owner:

- can look up a code only enough to validate pickup;
- can mark eligible pending codes as picked up for their own store;
- can update only their own store reward inventory through the controlled pickup action.

Non-S Store owner:

- cannot mark any redemption as picked up.

Admin / Manager:

- can read and manage all redemption records;
- can handle exceptions and replenishment.

Rep:

- can read assigned-store pickup and stock summary;
- cannot bypass Store owner pickup rules.

For Supabase, the safest path is to implement pickup as a controlled RPC or Edge Function that performs validation and inventory deduction in one transaction.

## UI Hardening Phase

The screenshot from `index.html#/app/materials/list` shows that deeper Admin pages can render modals with:

- dark or black modal frames;
- unreadable select input text;
- inconsistent footer background;
- cramped form layout;
- close button overlap.

This should be handled as a follow-up phase after the Store auth and reward design is approved.

Scope:

- Admin secondary and tertiary page modals;
- Ant Design `Modal`, `Select`, `Input`, `InputNumber`, `Upload`, and modal footers;
- Store Center modals if they share the same styling risk;
- Fan Center modals only if new reward history/pickup code views introduce regressions.

Design rule:

- modal content should use a stable light surface;
- labels and values should use dark readable text;
- select controls should not inherit dark shell backgrounds unless explicitly designed;
- modal footer should visually belong to the modal content;
- mobile width should avoid horizontal overflow.

Verification:

- browser screenshots for Materials Add modal, Store Reward Pickup modal, Fan Redemption modal, and at least one Admin edit modal;
- computed checks for modal background and text colors;
- `npm test`;
- `npm run build`.

## Implementation Phases

### Phase 1: Store Auth Cleanup

- Update Store login UI to Email / Password.
- Update Store registration UI to Store name / Owner email / Password / Phone / Country / City / Address.
- Make contact person non-required or remove it from the public form.
- Preserve local demo fallback only where allowed by environment flags.
- Add static tests for the new labels and removed required contact behavior.

### Phase 2: Reward Redemption Data and Fan Flow

- Add redemption status fields and expiration handling.
- Update Fan Rewards copy to say S-level store pickup.
- Store redemption code as `pending_pickup`.
- Add reward history or active code access in Fan Center.
- Add tests for code creation and status.

### Phase 3: Store Reward Pickup

- Add Store Center `Reward Pickup` tab or dashboard action.
- Implement code lookup and pickup confirmation.
- Enforce S-level-only pickup.
- Deduct store reward inventory and create movement records.
- Add tests for valid pickup, non-S rejection, used code rejection, expired code rejection, and insufficient stock.

### Phase 4: Admin Oversight

- Add Admin redemption list and filters.
- Add low S-store reward stock visibility.
- Add exception actions for cancel/expire/replenishment review.

### Phase 5: UI Hardening

- Fix shared modal/select/input styles for secondary and tertiary pages.
- Verify with browser screenshots and no-overflow checks.

## Acceptance Criteria

- Store login no longer presents Store ID / phone as the primary UI.
- Store registration no longer requires contact person.
- New Store registration can create or request a Store owner account without anonymous direct protected-table writes.
- Fan redeem creates a pending pickup code and deducts points.
- Only S-level Store owner accounts can confirm reward pickup.
- Pickup changes redemption status to `picked_up`.
- Pickup deducts store reward inventory.
- Non-S Store attempts are blocked with clear messaging.
- Admin can see redemption and stock history.
- Materials modal and other selected secondary/tertiary modals render with readable text and stable light surfaces after the UI hardening phase.

## Out of Scope for First Release

- Public custom domain.
- Full settlement or money rebate automation for S-level stores.
- Multi-quantity reward bundles unless a reward item explicitly defines quantity.
- QR scanning for redemption codes. Manual code input is enough for the first release.
- Allowing A/B/C stores to fulfill rewards.

