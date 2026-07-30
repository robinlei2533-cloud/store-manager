# UWELL CRM UI Optimization Proposal v2

> **Date**: 2026-07-21
> **Scope**: Optimize existing pages within the current yellow-green theme. Fix what violates `08_DESIGN_SYSTEM.md`. No new design language.
> **Methodology**: Impeccable Audit Framework (5-dimension scoring) + Design System Rule Compliance Check
> **Status**: Awaiting review. No code written.

---

## 0. Context — What We're Optimizing

### Current Theme (from `08_DESIGN_SYSTEM.md` — authoritative)

| Role | Color | Usage |
|------|-------|-------|
| **UWELL Yellow** | `#FFD700` / `#ccff00` / yellow-green variants | Primary actions, rewards, points, key highlights |
| **Neon/Active Green** | `#99d800`, `#9be900`, `#7ee000` | Growth, progress, approved, active, success |
| **Charcoal/Black** | `#000000`, `#0a0a0f` | Brand contrast, text, premium weight |
| **White/Light Gray** | `#ffffff`, gray variants | Readable surfaces |
| **Orange/Red** | orange/red tokens | Warning, rejected, risk, overdue |

### Current Design System Rules (from `08_DESIGN_SYSTEM.md`)

```
R1: Cards cannot be nested inside other cards
R2: One screen ≤ 3 major explanation blocks
R3: Long rules should be collapsed
R4: Home pages must prioritize actions, not documentation
R5: Fan UI: Use visual hierarchy — level, points, next action
R6: Fan UI: Use images/icons where they clarify, not as decoration
R7: Fan UI: Home should show check-in, scan, activity, rewards, nearby stores clearly
R8: Fan UI: Community should look like a real feed
R9: Fan UI: Rewards should use category/grid mall layout with image slots
R10: Fan UI: S Stores should be `UWELL Brand Store` with concise trust signals
R11: Fan UI: Fan-facing store labels should avoid negative wording for lower store levels
R12: Store UI: Home is a workbench
R13: Store UI: S Store reporting should be lightweight and work-focused
R14: Backend UI: Dashboard must be segmented
R15: Backend UI: Tables, filters, status tags, review queues must be consistent
R16: Backend UI: Do not create decorative big-screen dashboard visuals
R17: Contrast Rule: Core text/buttons must meet readable contrast
R18: Layout Rule: Mobile core buttons ≥ 44px high
R19: Layout Rule: Fan/store apps must have fixed bottom navigation
R20: Layout Rule: Secondary/detail pages must have a clear back button
```

---

## 1. Impeccable Audit — 5-Dimension Score

### Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Theming | **2/4** | Dual token systems (`--uw-` vs `--uwell-`) coexist; hardcoded hex in MapTab, CommunityTab, StoreOwnerPage |
| 2 | Anti-Patterns | **2/4** | Glassmorphism overuse; nested cards in Community; rules-as-main-content in Community/Rewards |
| 3 | Responsive Design | **3/4** | Good — bottom nav fixed, Task-100 scan alignment done. But Rewards chip overflow at 390px (T077-P2) still open |
| 4 | Accessibility | **2/4** | Semi-transparent inputs with low-contrast placeholder text (R17 violation); some interactive elements lack visible focus states |
| 5 | Performance | **3/4** | Background video has no poster fallback; 66KB index.css; but animations use transform/opacity (good) |
| **Total** | | **12/20** | **Acceptable — significant work needed on theming and anti-pattern dimensions** |

### Anti-Patterns Verdict (Impeccable AI Slop Test)

The fan portal has already reduced several AI tells (Task-095–101 removed hero metric cards, over-polished Home, added brand rhythm). However, remaining tells:

- **Glassmorphism overuse** on `liquid-glass` classes — the design system doc calls this "Liquid Glass Premium Dark Theme", which is intentional brand language, not AI slop
- **Nested cards** in Community (post card inside feed card inside page shell) — violates R1
- **Rules-as-hero-content** in Community and Rewards — violates R2, R4
- **Card grids** in Rewards — but this is intentional per R9 "category/grid mall layout", so NOT flagged

**Verdict**: The site has a defined brand language (not AI slop). The issues are consistency violations, not generic AI aesthetics. This is a **normalization** problem — the design system is defined but not uniformly applied.

---

## 2. Design System Compliance Audit — Page by Page

### 2.1 Fan Portal — Community (`CommunityTab.jsx`)

**Current state vs. Design System**:

| Rule | Status | Evidence |
|------|--------|----------|
| R8: "should look like a real feed" | ❌ FAIL | Pure text posts. No images, no rich media. Feels like a forum, not a social feed. Lines 93–98: seed posts are text-only. |
| R2: "≤ 3 major explanation blocks" | ❌ FAIL | Point rules block + composer + feed = 3 blocks. But the point rules block (`communityPointRules` description) takes ~30% of viewport on mobile. It's presented as equal-weight content, not a helper. Lines 78–90. |
| R4: "prioritize actions, not documentation" | ❌ FAIL | The expanded point rules (like = +2pts, comment = +3pts, post = +5pts with daily limits) is displayed as primary content. Should be collapsed behind a small "How points work" toggle. |
| R6: "use images where they clarify" | ❌ FAIL | No post images. No author avatar customization. Standard Ant Design `<Avatar>` with text initials. |
| R1: "cards cannot be nested" | ⚠️ WARN | Post cards inside the feed container use `<Card>` components. Acceptable if spacing is deliberate, but current layout creates card-in-card effect. |

**Specific violations**:
1. **`CommunityTab.jsx` lines 78–90**: `communityPointRules` object computed in `useMemo` renders as 3-line description block → should be collapsed
2. **`CommunityTab.jsx` lines 93–101**: seed posts `fp-001/002/003` are text-only → should have image placeholder slots matching the brand visual style
3. **`CommunityTab.jsx` lines 13–29**: 16-line key mapping for post translations → fragile, but functional. Not a UI issue.
4. **`CommunityTab.jsx` composer**: `<TextArea>` + `<Button>` without brand treatment → should match Home/Activities composer style

### 2.2 Fan Portal — Rewards (`MallTab.jsx`)

**Current state vs. Design System**:

| Rule | Status | Evidence |
|------|--------|----------|
| R9: "category/grid mall layout with image slots" | ⚠️ PARTIAL | Grid layout exists, but 3 of 8 items have `image: placeholder` — no real product image. Image slots exist but are empty. |
| R2: "≤ 3 major explanation blocks" | ❌ FAIL | Hero summary + rules section (7 bullet points joined into one string) + category chips + reward grid + redemption modal rules = exceeds limit. The pickup/review rule text repeats in hero and modal. |
| T077-P2: chip overflow at 390px | ❌ OPEN | `Coupon` and `VIP` chips overflow container on mobile → this is a known, unfixed issue |
| R6: "use images where they clarify" | ❌ FAIL | Reward cards have no product images for items like "Caliburn G4 Device" — uses placeholder path `/uwell-assets/rewards/task102-caliburn-g4-device.webp` |
| R17: contrast rule | ⚠️ WARN | Category chip background colors need verification against text contrast |

**Specific violations**:
1. **Category chip overflow**: `Coupon` (6 chars) + `VIP` (3 chars) + existing chip row → hits container boundary at 390px. Fix: wrap to 2 rows or reduce chip padding.
2. **Rules as hero**: 7-bullet `rewardRuleAuditText` displayed as a single paragraph in hero strip → collapse to 1-line hint with expandable modal (already has modal — just trim the hero).
3. **VIP empty category**: filter shows VIP but 0 items → hide or mark as "coming soon"
4. **Redemption modal**: raw code display (e.g. `UWELL-XXXX-XXXX`) without copy button or brand treatment

### 2.3 Fan Portal — Stores (`MapTab.jsx`)

**Current state vs. Design System**:

| Rule | Status | Evidence |
|------|--------|----------|
| R10: "S Stores = UWELL Brand Store with concise trust signals" | ✅ PASS | `localizeStorePresentation()` correctly maps S → "UWELL Brand Store", labels translated |
| R11: "avoid negative wording for lower levels" | ✅ PASS | B/C stores use "Listed" / "Partner store" — neutral |
| R6: "use images where they clarify" | ⚠️ WARN | Store popup has inline HTML with hardcoded styles (lines 52–69) — not tokenized, unscoped |
| R17: contrast rule | ⚠️ WARN | Popup uses `#3f5600` text on light green background — needs verification |
| R2: "≤ 3 major explanation blocks" | ✅ PASS | Map + filters + detail panel = 3 |

**Specific violations**:
1. **`MapTab.jsx` lines 13–18**: `LVL` object defines colors as inline hex (`#ccff00`, `#9be900`, `#e8f7a8`, `#eef3d5`) — should reference CSS custom properties for theming consistency
2. **`MapTab.jsx` lines 52–69**: `makePopup()` returns raw HTML template literal with inline styles — unscoped, unthemeable, fragile
3. **`MapTab.jsx` lines 145–156**: marker icon HTML also uses inline hex colors — same issue

### 2.4 Fan Portal — Me (`FanCenterPage.jsx` profile view)

**Current state vs. Design System**:

| Rule | Status | Evidence |
|------|--------|----------|
| R5: "visual hierarchy: level, points, next action" | ⚠️ PARTIAL | Profile card shows level + points, but sections are not visually separated |
| R2: "≤ 3 major explanation blocks" | ⚠️ WARN | Profile + Points History + Rewards History + Scan History + Invite + Help + Settings = too many equal-weight sections |
| R6: "use images where they clarify" | ❌ FAIL | History sections are pure text lists — no timeline visualization, no icon differentiation |

**Specific violations**:
1. **Section density**: Me view shows 7+ sections with equal visual weight → should group into 3 categories: Profile (top), Activity History (middle), Settings (bottom)
2. **Invite entry**: buried as text link → should be a compact card with "X friends invited, Y points earned"
3. **Language switcher**: buried in settings panel → should be more accessible (top-right of Me page)

### 2.5 Store Portal (`StoreOwnerPage.jsx`)

**Current state vs. Design System**:

| Rule | Status | Evidence |
|------|--------|----------|
| R12: "Home is a workbench" | ⚠️ PARTIAL | Workbench content exists but 4+ equal-weight cards compete for attention |
| R13: "S Store reporting should be lightweight" | ✅ PASS | S Report section is data-focused, uses tables |
| R2: "≤ 3 major explanation blocks" | ❌ FAIL | Workbench has: Today's queue + Readiness + Campaign execution + Reward pickup + Material inventory + S Report + Photo reminder = 7 sections |
| R17: contrast rule | ✅ PASS | Light text on dark background, verified in Task-090 |

**Specific violations**:
1. **Workbench visual hierarchy**: 7 sections at equal visual weight → top 3 should be prominent (Today's Queue, S Report, Campaign), rest secondary
2. **`StoreOwnerPage.jsx` lines 60–101+**: 40+ lines of inline Arabic translations — should be in `translations.js` (code quality, not UI)
3. **Photo reminder UX**: `STORE_PHOTO_REMINDER_LIMIT = 3` triggers a full-screen modal that blocks all navigation → demos should have a softer first-login experience

### 2.6 Admin Portal (`AppLayout.jsx` + admin pages)

**Current state vs. Design System**:

| Rule | Status | Evidence |
|------|--------|----------|
| R14: "Dashboard must be segmented" | ✅ PASS | Dashboard has stat cards + chart area |
| R15: "Tables, filters, status tags must be consistent" | ⚠️ WARN | S Store Management table has column squeeze (T077-P1), inconsistent column widths |
| R16: "Do not create decorative big-screen visuals" | ✅ PASS | No decorative dashboard present |
| R2: "≤ 3 major explanation blocks" | ✅ PASS | Admin pages are data-first |

**Specific violations**:
1. **`AppLayout.jsx` sidebar**: 16+ menu items visible at once → group collapse for "Fan Ops", "Materials", "Field Visits" submenus
2. **S Store Management table**: T077-P1 — columns overflow on 1440px viewport. Fix: set `tableLayout: 'fixed'` or constrain column widths.

---

## 3. Optimization Plan — Within Current Theme

### Principle

> **Every change must be traceable to a violated rule in `08_DESIGN_SYSTEM.md`. No change is "because it looks better" — it's because it violates a documented standard.**

### Batch 1: P0 Token Unification (Foundation, affects all)

| Task | Target | Violation | Change |
|------|--------|-----------|--------|
| D01 | `tokens.css` + `index.css` | Dual token systems | Merge `--uwell-*` tokens into `--uw-*` namespace. Keep `--uw-gold-primary: #FFD700` (current theme). Add comments marking merged tokens. |
| D02 | `index.css` | 66KB monolithic file | Split into `tokens.css` (design tokens only), keep `index.css` for component styles. This is a file-level reorg, no visual change. |

### Batch 2: P1 Content Density Compliance (Fan Portal)

| Task | Page | Violated Rules | Changes | Files |
|------|------|---------------|---------|-------|
| B2A | Community | R2, R4, R8 | Collapse point rules to 1-line hint with expand toggle. Move rules from hero position to inline helper. | `CommunityTab.jsx`, `index.css`, `translations.js` |
| B2B | Rewards | R2, T077-P2 | Trim hero rules to 1-line hint. Fix 390px chip overflow (flex-wrap or 2-row). Hide VIP empty category. | `MallTab.jsx`, `index.css` |
| B2C | Stores | R6 (tokenize) | Replace inline hex in `LVL` and `makePopup()` with CSS custom property references. Add `var(--uw-store-s)` etc. tokens. | `MapTab.jsx`, `index.css`, `tokens.css` |
| B2D | Me | R2, R5 | Group Me sections into 3 tiers: Profile (top), History (middle), Settings (bottom). Add section dividers. | `FanCenterPage.jsx`, `index.css` |

### Batch 3: P1 Portal Compliance (Store + Admin)

| Task | Page | Violated Rules | Changes | Files |
|------|------|---------------|---------|-------|
| B3A | Store App | R2, R12 | Workbench visual hierarchy: top 3 cards prominent (Today + S Report + Campaign), rest secondary weight via smaller cards or collapsed sections | `StoreOwnerPage.jsx`, `index.css` |
| B3B | Admin | R15, T077-P1 | Fix S Store table squeeze. Sidebar group labels for submenu collapse. | `AppLayout.jsx`, admin CSS |

### Batch 4: P2 Polish (Rest)

| Task | Target | Changes |
|------|--------|---------|
| B4A | Invite tab | Brand card treatment (matching Home visual rhythm) |
| B4B | Check-in tab | Streak celebration visual (pulse animation on 7/30 day milestones) |
| B4C | Help tab | Collapse long FAQ text; add icon + title pattern |
| B4D | Oldfan verification | Add clear status indicator + brand back button |

---

## 4. What This Proposal Is NOT

| ❌ NOT doing | Why |
|-------------|-----|
| Changing color theme | Yellow-green is the confirmed theme from `08_DESIGN_SYSTEM.md`. We're making pages comply with it, not replace it. |
| Adding new features | No new pages, no new interactions beyond what the design system already calls for |
| Redesigning pages | Every change is a targeted fix for a specific rule violation |
| Adding new dependencies | No npm install |
| Touching DB/API/permissions | Pure frontend UI compliance |
| Using `/preview/fan` | Real fan portal only |

---

## 5. Recommended Execution Order

```
D01 → D02 (token foundation — must go first)
   ↓
B2B (Rewards — highest user-facing impact + known trial defect T077-P2)
   ↓
B2A (Community — highest rule violation count after D01/D02)
   ↓
B2C (Stores — tokenize existing inline styles)
   ↓
B2D (Me — section grouping)
   ↓
B3A (Store App — workbench hierarchy)
   ↓
B3B (Admin — table squeeze + sidebar)
   ↓
B4A–D (Secondary pages polish)
```

---

## 6. Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Token merge breaks existing pages | Each merge step has a rollback path. Test after each batch. |
| CSS split causes specificity issues | Keep selectors scoped. Run focused regression tests. |
| Community rules collapse loses information | Rules still accessible via expand toggle — same data, less visual weight |
| Rewards chip fix changes layout | Wrapping to 2 rows is the simplest fix. Test at 390px. |

---

## 7. Summary — Flaw Count

| Severity | Count | Category |
|----------|-------|----------|
| **P0** | 2 | Token unification (D01), CSS architecture (D02) |
| **P1** | 8 | Community rules density, Rewards overflow + empty category + rules hero, Stores inline hex, Me section density, Store workbench hierarchy, Admin table squeeze |
| **P2** | 5 | Invite brand, Check-in streak animation, Help text collapse, Oldfan status, Store photo UX |
| **Total** | **15** | Down from 41 in v1 (focused on actual violations, not aspirational improvements) |

---

**UI Designer**: 像素君  
**Date**: 2026-07-21  
**Theme**: UWELL Yellow-Green (#FFD700 / #ccff00 family) — per `08_DESIGN_SYSTEM.md`  
**Method**: Impeccable Audit + Design System Rule Compliance  
**Reference docs**: `08_DESIGN_SYSTEM.md`, `17_FAN_REAL_MODULE_BASELINE.md`, `27_TRIAL_ISSUE_LOG_AND_LAUNCH_CHECKLIST.md`, `PROGRESS.md`
