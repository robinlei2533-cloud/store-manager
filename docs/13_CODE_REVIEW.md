# UWELL CRM Code Review Standard

## Review Goal

Code review must protect product direction, UI consistency, database consistency, permissions, and maintainability.

## Required Review Sections

### Product

- Does the change match `01_PRODUCT_BIBLE.md`?
- Does it preserve existing confirmed functions?
- Does it introduce duplicate functionality?
- Does it invent unconfirmed business logic?

### UI

- Does it match `08_DESIGN_SYSTEM.md`?
- Does the page keep the correct portal personality?
- Is text density acceptable?
- Are fixed navigation and back behavior preserved?
- Are contrast and touch targets acceptable?

### Business Logic

- Is the rule defined in `09_BUSINESS_RULES.md`?
- Is there only one source for the rule?
- Are edge cases handled?
- Are records written for important actions?

### Database

- Does the change affect tables?
- Is migration required?
- Is local DB affected?
- Is Supabase RLS affected?
- Is seed data affected?

### Permission

- Does the role access match `07_RBAC.md`?
- Can Store see only own data?
- Can Field Rep see only assigned scope?
- Can Manager see only assigned region?
- Is Admin-only behavior protected?

### Tests

- Are relevant tests updated or added?
- Does `npm test` pass?
- Does `npm run build` pass when frontend code changed?
- Are manual browser checks needed?

## Review Output Format

1. Blocking issues
2. Non-blocking issues
3. Missing tests
4. Product/design concerns
5. Approval or requested changes

