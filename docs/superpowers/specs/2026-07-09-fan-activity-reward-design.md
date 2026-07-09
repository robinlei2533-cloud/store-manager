# Fan Activity and Reward Closure Design

## Goal
Finish the fan activity loop for trial operation without changing the core CRM frame: store owners can submit store activities, approved activities appear in the fan center, fans can earn light engagement points after a 10 second stay, and reward exchange rules are explicit.

## Store Activity Flow
Store owners submit an activity from the Store Center. The record is saved as a campaign with `source: "store_application"`, `submitted_by_store_id`, `approval_status: "pending"`, and `fan_visible: false`. Admin review can later approve it by setting `approval_status: "approved"`, `fan_visible: true`, and `status: "ongoing"` or `planned`. The fan center only shows approved and visible store activities.

## Fan Engagement Tasks
Official article and Instagram tasks use a 10 second active stay rule. Opening a task starts a modal countdown and opens the official URL in a new tab. The task can be claimed only after the countdown reaches zero. Each task can be claimed once per fan per day, and the page visibility API pauses the countdown when the task page is hidden.

## Reward Exchange Rules
Rewards are grouped into four tiers: 50-100 points for small gifts, 150-300 points for standard merchandise, 300-600 points for pods/accessories/store coupons, and 800-1500 points for devices or VIP gifts. A redemption deducts points and creates a pickup code. Only S-level stores can confirm pickup. Codes expire after 7 days and can be used once. High value rewards are limited to one per fan per month in trial policy.

## Testing
Unit tests cover store activity visibility, 10 second task claim state, once-per-day task limits, and reward tier metadata. Browser acceptance checks the fan activity modal, store activity display, and reward rule copy.
