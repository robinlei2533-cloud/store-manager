# UWELL CRM Task Template

Use this template for every future development task.

## Task ID

Task-XXX

## Task Name

Short name.

## Goal

What this task should achieve.

## Step 1: Analyze Requirement

- What is the user asking for?
- Which product rule does it support?
- Is anything unclear?

For UI / experience tasks, also state:

- Real page route to QA before coding:
- Current visible problems found:
- What must be preserved:
- Whether this is visual-only or changes business behavior:

## Step 2: Analyze Impact

- Fan app impact:
- Store app impact:
- Backend impact:
- API impact:
- Database impact:
- Permission impact:

## Step 3: Files To Modify

Expected files:

- Create:
- Modify:
- Delete:

For UI / visual tasks, expected plan detail must include:

- Page area / component:
- Existing problem:
- Exact change:
- File(s):
- Image/video slot:
- Asset source:
- Fallback if asset is unavailable:
- Acceptance check:

Do not accept a UI plan that only says "improve layout", "make premium", "add images", or "reduce text" without the concrete fields above.

## Step 4: Database Impact

- Tables affected:
- Fields affected:
- Migration needed: Yes/No
- Seed data affected: Yes/No
- RLS affected: Yes/No
- Local DB version affected: Yes/No

## Step 5: Other Page Impact

- Pages affected:
- Shared components affected:
- Navigation affected:
- Existing flow affected:

## Step 6: Risks

- Product risk:
- UI risk:
- Database risk:
- Permission risk:
- Testing risk:

For UI / visual tasks, also state:

- Asset risk:
- Repeated-image risk:
- Navigation overlap risk:
- Mobile layout risk:
- Arabic/RTL risk where relevant:

## Step 7: Real Page QA Plan

Required for UI / experience tasks before development:

- Route:
- Account / entry method:
- Viewports:
- Current screenshots/artifacts:
- Metrics to collect:
  - image/video count;
  - unique asset sources;
  - broken assets;
  - horizontal overflow;
  - fixed navigation overlap;
  - button visibility and clarity;
  - visible language/RTL issues.

## Step 8: Visual Asset Plan

Required when adding or replacing images/videos:

- Slot 1:
  - Page area:
  - Desired content:
  - Preferred source:
  - Final file path:
  - Fallback:
- Slot 2:
  - Page area:
  - Desired content:
  - Preferred source:
  - Final file path:
  - Fallback:

Add as many slots as the task requires. Every visible asset slot must have one row.

## Confirmation Gate

Do not start development until the user confirms.

## Development Summary Format

After development, output:

1. What changed
2. Why it changed
3. Which pages were affected
4. Which database tables were affected
5. Follow-up notes
6. Next recommendation

## Current Status Format

```md
# Current Status

## Completed

- Fan home
- Store registration
- Backend Dashboard

## In Progress

- Points system
- Activity system

## To Optimize

- UI consistency
- Permissions

## Current Bugs

1.
2.

## Next Task

Task-023
Optimize store detail page
```
