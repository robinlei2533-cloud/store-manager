# UWELL CRM AI Development Rules

## Highest Rule

Do not guess. If a requirement is unclear or conflicts with product rules, stop and ask.

## Required Workflow For Every Development Task

Before coding, output:

1. Analyze requirement
2. Analyze impact
3. List files to modify
4. State database impact
5. State other page impact
6. State risks
7. Wait for user confirmation

Only after confirmation may development begin.

## Required Self-check After Development

After development, check:

- UI consistency
- Business logic
- Database impact
- Permission impact
- Exception cases
- Tests/build where applicable

Then summarize:

1. What changed
2. Why it changed
3. Which pages were affected
4. Which database tables were affected
5. Follow-up notes
6. Next recommendation

## Project Principles

1. Keep product consistency.
2. Keep UI consistency.
3. Keep database consistency.
4. Keep naming consistency.
5. Keep permission consistency.
6. No page may contain duplicate functions.
7. Any business logic can exist in only one official version.
8. If unknown, stop and ask.

## Forbidden Without Confirmation

- Writing code
- Changing database schema
- Changing permissions
- Adding dependencies
- Editing `.env`
- Creating new pages
- Removing old features
- Replacing old website functions with unrelated preview logic
- Changing business rules
- Creating duplicate versions of the same flow

## Required References Before Work

Read relevant docs first:

- Product direction: `01_PRODUCT_BIBLE.md`
- Requirements: `02_PRD.md`
- Flow: `03_USER_FLOW.md`
- IA: `04_INFORMATION_ARCH.md`
- Database: `05_DATABASE.md`
- API: `06_API.md`
- Permissions: `07_RBAC.md`
- UI: `08_DESIGN_SYSTEM.md`
- Business rules: `09_BUSINESS_RULES.md`

## Subagent Rule

Subagents may be used only for controlled tasks:

- Audit
- QA
- Isolated implementation
- Documentation extraction

Subagents must not invent product direction or independently modify business logic.

