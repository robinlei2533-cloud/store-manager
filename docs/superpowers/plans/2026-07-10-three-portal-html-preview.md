# Three Portal Detailed HTML Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one standalone HTML preview document that turns the approved fan, store, and admin/field-ops redesign specs into detailed clickable screen previews for review before production implementation.

**Architecture:** Create an isolated static HTML file under `design-preview/` so the production app routes and code are untouched. The page uses in-file CSS and JavaScript only, with tabbed preview navigation and screen panels for fan mobile, store mobile, and admin desktop views.

**Tech Stack:** HTML, CSS, vanilla JavaScript. No new dependencies. No `.env` changes.

## Global Constraints

- Use the approved specs from `docs/superpowers/specs/2026-07-10-fan-app-redesign-design.md`, `2026-07-10-store-app-redesign-design.md`, and `2026-07-10-admin-field-ops-redesign-design.md`.
- Default interface language is English; Arabic is the only second language represented.
- Visual theme uses UWELL yellow-green direction.
- This is a preview document only and must not modify production routes.
- Do not run `npm install` or `pip install`.

---

### Task 1: Create Standalone Preview HTML

**Files:**
- Create: `design-preview/uwell-three-portal-preview-20260710.html`

**Interfaces:**
- Consumes: the three approved redesign spec documents.
- Produces: a browser-openable static HTML preview file.

- [ ] Create the standalone preview with sections: overview, fan app, store app, admin/field ops, rules checklist.
- [ ] Add mobile mock frames for fan and store screens.
- [ ] Add desktop console mock frames for admin screens.
- [ ] Add click behavior for switching screen previews.
- [ ] Verify the file can open locally in a browser.

### Task 2: Verify Preview File

**Files:**
- Verify: `design-preview/uwell-three-portal-preview-20260710.html`

**Interfaces:**
- Consumes: the generated HTML file.
- Produces: confirmation that the file exists, contains key required sections, and has no TODO/TBD placeholders.

- [ ] Run placeholder scan for `TODO`, `TBD`, and `placeholder`.
- [ ] Run section scan for `Fan App`, `Store App`, `Admin Console`, `Field Visits`, `Scan Codes`, and `Settings > Users`.
- [ ] Report the absolute local file path and optional local server URL.
