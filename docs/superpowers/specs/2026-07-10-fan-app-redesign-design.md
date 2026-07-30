# UWELL CRM Fan App Redesign Design

Date: 2026-07-10
Status: Draft for user review

## Goal

Redesign the fan app into a light, young, reward-driven UWELL member experience. The app should feel easy for fans to use every day, support store traffic, and make rewards, activities, and scanning obvious without forcing users to read long instructions.

The current fan app has too many visible functions at once, long text blocks, unstable fan-profile fallback behavior, and navigation that can leave users unsure how to return. This redesign focuses on simpler operation logic before deeper visual polish.

## Core Principles

- Default language is English.
- Arabic is the only second language for the trial version and must support full RTL layout.
- Other languages are hidden for now and can be restored for global rollout later.
- Home must use short copy, images, icons, and motion instead of long explanatory text.
- Main navigation stays fixed at the bottom.
- Any detail or secondary page must show a clear back button.
- Fans should always understand four things: what to do, what they earn, where to go, and how to return.
- Error states must be friendly and recoverable. Fans should not repeatedly see technical fallback screens such as "No fan profile found" or "Back to Home".

## Visual Direction

Use the latest UWELL yellow-green packaging direction as the fan app theme.

Design language:

- Bright UWELL yellow for primary rewards, points, and action buttons.
- Neon green for growth, activity, completion, and energy.
- Black or charcoal for product contrast and brand weight.
- White and light gray surfaces to keep the app readable.
- Product and reward images should carry the experience more than text.
- Cards should feel like product packaging stickers, event posters, or reward tiles rather than admin dashboard cards.

Two visual variants should be produced later for review:

1. Packaging impact style: stronger yellow/green blocks, diagonal shapes, bold product-poster energy.
2. Clean member style: lighter surfaces, clearer hierarchy, still using yellow-green UWELL accents.

## Main Navigation

The fan app uses six fixed bottom navigation items:

1. Home
2. Activities
3. Community
4. Rewards
5. Stores
6. Me

Removed from primary navigation:

- Daily Tasks
- Invite
- Help / How it works

Invite becomes a popup, Home card, or Me secondary entry. Help and onboarding become secondary entries under Me.

## Home

Home is the daily action hub. It should answer: "What can I do right now?"

First screen order:

1. Member card: level, available points, level progress.
2. Quick actions: Check in and Scan.
3. Recommended activities carousel.
4. Recommended rewards.
5. Nearby activity stores.

Home copy should be extremely short:

- Check in
- Scan
- Earn points
- Nearby
- Redeem
- Join now

Home should not contain long rules. Tapping a card navigates to the matching section or detail page.

## Activities

Activities has two tabs:

1. Official
2. Store Events

Official activities include:

- UWELL official article tasks.
- UWELL website tasks.
- Instagram viewing tasks.
- Like, comment, or share tasks.
- Brand campaigns and product launches.

Store Events include:

- Offline check-in.
- Store experience events.
- Store promotions.
- Store reward pickup campaigns.

Activity card structure:

- Image
- Type tag
- Title
- Reward
- Source or store
- Main CTA

Official CTAs:

- Start
- Open
- Claim

Store CTAs:

- Join
- Navigate
- Check in

Activity detail pages:

- Must show a back button.
- Show activity image, reward, time, location, and up to three steps.
- Long rules are hidden in a collapsed Rules section.
- Store activities must include a Navigate action that opens the related store in Stores or external map navigation.

## Community

Community is a lightweight social layer, not a complex forum in the first version.

Initial functions:

- Post or share product/reward content.
- Like posts.
- Comment on posts.
- Show official picks.
- Show popular posts.

Community point rules:

| Action | Points | Daily counted limit |
|---|---:|---:|
| Like | +1 | 10 counted likes per day |
| Comment | +2 | 5 counted comments per day |
| Post / share article | +10 | First post per day only |

Anti-abuse rules:

- Liking the same post only counts once.
- Liking your own post does not count.
- Very short comments should not count. Initial threshold: at least 5 characters.
- Deleted or reported content keeps an audit trail for future manual review.
- Community points count toward both available points and lifetime growth points.

## Rewards

Rewards is the point mall.

Sections:

1. Available now
2. Almost there
3. Level exclusive
4. Diamond rewards

Reward card structure:

- Reward image
- Reward name
- Required points
- Required level
- Pickup or approval rule
- Redeem CTA
- View stores secondary CTA

Inventory display:

- Normal rewards show In stock or Limited.
- Do not show exact stock numbers in the fan app.
- Diamond rewards show Limited slots.

Pickup and approval:

| Reward type | Rule |
|---|---|
| Normal rewards | A or S stores can fulfill |
| Advanced rewards | S stores only |
| Diamond luxury rewards | Requires backend review |

## Stores

Stores helps fans find where to join activities, redeem rewards, or visit UWELL partner stores.

Functions:

- Nearby stores.
- Activity stores.
- Reward pickup stores.
- Store level badges.
- Navigate action.

Store cards should show:

- Store name
- Level
- City or distance when available
- Supported actions: Reward pickup, Activity, Display store
- Navigate button

Activity cards that have a related store should be able to jump into this page with the store highlighted.

## Me

Me is the fan account and member center.

Sections:

1. Account card: avatar, name, level, available points.
2. Level benefits: current benefits and next-level preview.
3. Progress: points needed for next level.
4. Records: points, rewards, activities.
5. Invite friends.
6. Member QR / identity code.
7. Settings: language switch, logout.
8. Help / How it works.

The member QR / identity code should be a secondary modal, not a large default block. It can be used by store staff to verify identity or reward pickup.

## Level System

Use four fan levels:

| Level | Lifetime growth points | Positioning |
|---|---:|---|
| Bronze | 0 | New fan |
| Silver | 300 | Active fan |
| Gold | 1000 | Highly active fan |
| Diamond | 5000 | Core fan |

Important rule:

- Level is based on lifetime growth points.
- Reward redemption spends available points.
- Redemption must not downgrade a user's level.

## Point Sources

Initial point rules:

| Action | Points |
|---|---:|
| Daily check-in | +5 |
| UWELL unique product code scan | +5 |
| Official website or article task | +5 |
| Instagram viewing task | +5 |
| Like/comment/share official task | +10 |
| Store event check-in | +20 to +100, configured per event |
| Invite friend registration | +50 |
| Old fan verification / profile completion | +100 |
| Community like | +1, counted up to 10 per day |
| Community comment | +2, counted up to 5 per day |
| Community post/share | +10, first post per day only |

## Scan Rules

Scan is a core anti-fraud and growth module.

Supported code types:

- UWELL unique product QR code.
- UWELL unique product barcode if supported by code data.
- Store event QR code.
- Official activity QR code.
- Fan center entry QR code.
- Official website, social, or private community QR code.

Not every code grants points.

Scan classification:

| Code type | Points | Behavior |
|---|---:|---|
| UWELL unique product code | Yes | Main scan point source |
| Store event code | Yes | Event or check-in reward |
| Official activity code | Yes | Activity reward |
| Fan center entry code | Optional | Mainly opens fan app |
| Website/social/community code | Depends on activity | Can become a task entry |
| Non-UWELL code | No | Friendly invalid state |

Product code rule:

- Product codes are globally unique.
- First valid claim earns points.
- Same fan scanning the same code again gets no points.
- Another fan scanning an already claimed code gets no points and the scan is marked suspicious.
- Each fan can earn product scan points at most 3 times per day.
- After the daily limit, scan recognition can still work but points are not awarded.

Suggested scan result copy:

- Valid UWELL product. +5 points.
- This code has already been claimed.
- Daily scan limit reached.
- This code is not eligible.

Future backend code-rule fields:

- code_id
- code_type
- product_sku
- product_name
- batch_no
- status: unused, claimed, suspicious, blocked
- claimed_by
- claimed_at
- scan_count
- suspicious_reason
- valid_from
- valid_until
- reward_points
- linked_store_id
- linked_campaign_id

## Onboarding

Show onboarding on first registration or first fan app entry. It should be short, visual, and skippable.

The onboarding points channel copy should use four sources:

1. Scan
2. Check in
3. Activities
4. Community

Suggested three-page onboarding:

1. Earn with Scan and Check in
   - Scan UWELL product codes.
   - Check in daily.

2. Join Activities
   - Complete official and store events.
   - Find nearby stores.

3. Play in Community and Redeem
   - Like, comment, and post to earn.
   - Redeem rewards with points.

Final CTA:

- Start earning

Onboarding must support English and Arabic RTL.

## Error Handling

The current "No fan profile found / Back to Home" fallback should not be a normal fan-facing experience.

New behavior:

- Try to recover the fan profile from current auth session, saved fan id, and local fallback data.
- If recovery succeeds, return to Home.
- If recovery fails, clear invalid fan session state and send the user to fan login.
- Show friendly copy, not technical copy.

Suggested copy:

- We could not find your member profile.
- Please sign in again.
- Sign in

Avoid "Back to Home" if Home cannot work without a fan profile.

## Navigation Rules

- Bottom navigation is fixed on main pages.
- Detail pages must have a clear back button.
- Back button appears top-left in English LTR.
- Back button appears top-right in Arabic RTL.
- Detail pages should keep users inside the fan app unless opening external maps, official website, or social platforms.
- Actions should be direct and predictable.

## Language And RTL

Trial language scope:

- English
- Arabic

Default:

- English for fan, store, and admin/field management interfaces.

Arabic RTL requirements:

- Page direction changes to rtl.
- Navigation order and text alignment adapt to RTL.
- Back button moves to the right.
- Icons and label spacing reverse.
- Forms and inputs align correctly.
- Cards and modal layouts must not overflow with Arabic text.
- Copy must stay short in both languages.

## Account And Email Rules

Fan registration must require a valid email format and a real-looking email domain suffix.

Rules:

- Email must match normal email format.
- Email domain must include a valid suffix, such as `.com`, `.net`, `.org`, `.sa`, or another real TLD.
- Clearly fake formats such as `123@123`, `123@123.`, or malformed addresses are rejected.
- Trial validation can use format and suffix checks first.
- Later production validation can add email verification links or OTP.

## Out Of Scope For First Redesign

- Full global language rollout.
- Complex comment threading.
- Advanced moderation workflows.
- Exact stock numbers in fan app.
- Fully automated luxury reward approval.
- Real backend product-code generation. The first implementation can define interfaces and local behavior, but production anti-fraud requires server validation.

## Open Items For Review

- Final reward catalog and real product images.
- Exact Diamond luxury reward list.
- Whether community post images are mandatory or optional.
- Whether scan location should be requested for store/event validation.
- Final Arabic translations and tone.

## 2026-07-11 Confirmed Update

This section supersedes any earlier conflicting detail in this document.

### Home Final Structure

Home is a light daily action hub, not a content-heavy dashboard.

First screen:

1. Game-style growth card
   - Hi, fan name
   - Current level
   - Available points
   - Progress to next level or next premium Diamond reward
   - Count-up points and progress fill animation are allowed

2. Three light task cards
   - Daily Check-in
   - Scan UWELL Code
   - Join Activity

3. One recommended activity only
   - Do not show a carousel on Home in the first version.
   - Prioritize nearby S/A store events, active official campaigns, high-point activities, or level-relevant activities.

4. Quick tips
   - Show at most two short reminders.
   - Examples: first community post earns +10, one scan left today, S-level store event nearby.

Home should not use many product images. If imagery is used, it should be one restrained hero or small activity/reward thumbnail, not a website-style banner stack.

### Activities Verification Loop

Store activities require a verification loop. A fan clicking Join is not enough to earn points.

Main offline activity flow:

1. Fan joins a store activity.
2. Fan visits the store.
3. Fan shows member or activity QR code.
4. Store scans the fan QR in Store Verify.
5. Store confirms participation.
6. System checks rules and awards points or sends the record to review.

Store users do not give points manually. They only verify participation. The system awards points according to campaign rules.

Activity states:

- Joined
- Pending verification
- Verified
- Points added
- Pending review
- Rejected
- Duplicate
- Expired

Online official activities can be verified by system records such as scan, like, comment, post, or external task completion where available.

High-value activities require backend review after store verification.

### Invite And Existing Fan Verification

Invite Friends and Existing Fan Verification are not bottom navigation items.

Invite Friends appears in:

- Me as a long-term entry.
- Home as a temporary reminder or campaign popup.
- Rewards or Activities when invite rewards are active.

Existing Fan Verification appears in:

- Fan registration or login flow.
- Me if the fan has not verified old-fan status.

Approved existing fan verification can grant initial points, badge, or old-fan eligibility according to backend rules.

### Rewards Image Framework

Reward cards must reserve a fixed image area even before final images are ready.

Rules:

- Normal reward cards use fixed 1:1 or 4:3 image slots.
- Missing images show UWELL yellow-green default artwork by reward type.
- Diamond or luxury reward detail pages can use a stronger 16:9 visual.
- Reward images support recognition; they must not turn Rewards into a marketing page.

### Reward Catalog Initial Draft

Reward content and point costs are configurable in backend. Redemption logic is fixed.

| Reward | Initial points | Level | Review |
|---|---:|---|---|
| UWELL lanyard | 100 | Bronze+ | No |
| Single pod | 150 | Bronze+ | Region compliance check |
| Stickers / small merchandise | 150-200 | Bronze+ | No |
| Cap | 300 | Silver+ | No |
| T-shirt | 350 | Silver+ | No |
| Waist bag | 400 | Silver+ | No |
| UKUUKU IP doll | 600 | Silver+ | No |
| Multi-pod pack | 700-1000 | Gold+ | Region compliance check |
| Limited merchandise set | 1200 | Gold+ | No |
| UWELL gift box | 2000-3000 | Gold+ | Optional review |
| Sample device / trial device | 3000-4000 | Gold+ | Required |
| Product bundle | 4000-5000 | Gold+ / Diamond | Required |
| Sample big bundle | 5000-7000 | Diamond | Required |
| UWELL full material / collector set | 6000-8000 | Diamond | Required |
| Premium headphones | 8000-10000 | Diamond | Required |
| Phone or high-value electronics | 12000-20000 | Diamond | Required |
| One-week China trip | 10000-20000 | Diamond | Required |

Luxury rewards must never be auto-approved in the first version.

### Stores Page Final Direction

Stores should focus on finding nearby UWELL stores, not browsing pictures.

Core structure:

- Search / current location
- Filters: Nearby, Featured, Activities, Open now
- Map area
- Featured or recommended store card
- Store list

Store levels shown to fans:

- S-level: Featured
- A-level: Recommended
- B/C-level: listed normally without negative wording

Store front photos are optional but should be supported for map/store detail trust.

### Me Final Additions

Me includes:

- Profile card
- Growth card
- Available points
- Lifetime growth points
- Points history
- Redemption history
- Scan history
- Activity history
- Invite Friends
- Existing Fan Verification if not verified
- New User Guide
- Language: English / Arabic

Me should not use product marketing images.
