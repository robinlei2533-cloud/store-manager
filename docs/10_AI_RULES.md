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

## Required Workflow For UI / Experience Optimization

UI optimization has an additional hard gate before coding.

Before proposing or implementing UI changes, first inspect the real page, not preview pages or memory. The plan must include:

1. Real route checked.
2. Current visible problems found by QA.
3. Exact page areas to change.
4. Exact components/files to modify.
5. Exact image/video slots to add, replace, remove, or keep.
6. Asset source plan:
   - UWELL official website / download center / official social channels first;
   - credible public references second;
   - project-local mockup assets only when real suitable assets are unavailable.
7. Fallback rule for missing assets.
8. Acceptance metrics, such as image count, unique image sources, broken image count, horizontal overflow, navigation overlap, mobile/desktop checks, and RTL checks when relevant.
9. Visual slot plan:
   - list each page slot separately;
   - assign one primary asset to each slot;
   - assign one distinct fallback to each slot;
   - do not reuse one image across unrelated slots without explicit user approval.

Forbidden UI planning patterns:

- generic statements such as "make it premium" without naming concrete page regions;
- saying "add images" without listing which slots receive which assets;
- replacing real pages with `/preview/fan`;
- changing business rules while doing visual cleanup;
- using one repeated image to satisfy multiple unrelated visual slots unless the user explicitly approves.

## Fan UI Task Gate

For fan UI work, the AI must treat `PROGRESS.md` as the current memory, `docs` as the rule source, and `AGENTS.md` as the development constraint source. If chat history is incomplete, recover context from those files before planning.

Before any fan UI implementation, output a page-specific QA and impact analysis:

1. Real route checked: use `http://127.0.0.1:5173/fan-app.html#/fan-center` or the active real fan route.
2. Real page states checked: name the exact fan pages or subpages, such as `Home`, `Community`, `Stores`, `Me`, `Scan`, `Check-in`, `Invite`, `Old fan verification`, or `Help`.
3. Current visible problems: list concrete issues found in the real page, not assumed issues.
4. Exact page regions to change: name the hero, toolbar, feed composer, card grid, map area, account header, bottom nav safe area, secondary title bar, or other concrete region.
5. Exact files to modify.
6. Database/API/permission impact: explicitly state none or list the affected contract.
7. Other page impact: explicitly state whether shared CSS or shell behavior affects other fan pages.
8. Risk and rollback: name the risk and the files that can be reverted.
9. Wait for user confirmation.

Fan visual work must include a visual slot plan before coding:

| Slot | Page region | Purpose | Primary source | Final path | Fallback | Desktop fit | Mobile fit |
|---|---|---|---|---|---|---|---|

Rules for the table:

- Fill every column. Do not use `TBD`.
- Each slot must have a different fallback unless the user approves reuse.
- Official UWELL sources and official social/download materials come first.
- Credible public references come second.
- Project-local mockups are allowed only after real-source search is not suitable.
- Store pages must prefer store, shelf, storefront, display, or vape retail imagery over unrelated product hero images.
- If local mockups are used, file names or documentation must make clear they are local mockups, not official UWELL photography.

Fan UI implementation must not:

- use `/preview/fan`;
- replace real fan flows with isolated preview logic;
- hide or remove check-in, scan, points, rewards, activities, community, stores, S Store, or backend data loops;
- add business rules without user confirmation;
- place oversized media over text or primary actions;
- count repeated images as visual diversity;
- leave visible unfinished labels such as `coming soon` as a primary CTA.

After fan UI implementation, the self-check must include:

- desktop screenshot at about `1440x980`;
- mobile screenshot at about `390x844`;
- rendered image/video count;
- unique image/video source count;
- broken image/video count;
- text overlap check;
- bottom navigation overlap check;
- horizontal overflow check;
- RTL check when Arabic or shared shell layout is touched;
- focused fan tests, full `npm test`, and `npm run build` unless the user explicitly limits verification.

## Required Self-check After Development

After development, check:

- UI consistency
- Real page QA against the original visible problems
- Image/video rendering, uniqueness, and broken asset checks when visuals changed
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
