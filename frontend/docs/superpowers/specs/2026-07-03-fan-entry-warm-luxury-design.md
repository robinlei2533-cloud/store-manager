# Fan Entry Warm Luxury Design

## Goal

Transform the existing 5173 fan login page into a warm, premium UWELL fan entry experience based on the local Shamoni-style reference, without rebuilding a separate demo.

## Approved Direction

- Target page: `http://127.0.0.1:5173/fan-app.html#/fan-entry`.
- First screen uses a warm white editorial surface, subtle grid texture, soft mist, and floating glass orbs.
- Main title is `Uwell Fans Club`.
- The orbs keep the reference page's slow luxury drift and pointer parallax, but replace the jewel core with CALIBURN product imagery.
- The old fan-entry decorative effects are removed from the first screen: particle network, aurora, meteor shower, galaxy layer, and click spark.
- Login and registration are not shown as a permanent first-screen card. The first screen shows a black pill `Join / Sign in` CTA; clicking it opens a modal containing the existing login/register flows.
- Language and settings controls remain in the top-right and are restyled for visibility on a light background.
- Feature explanation, product browsing, and fan benefits move below the hero so the first user action stays clear.

## Behavior

- Login and registration continue to use the existing local demo auth flow and still navigate to `/fan-center` after success.
- Product modal behavior can remain for the lower product strip.
- Motion respects `prefers-reduced-motion` by drawing a static first frame and skipping continuous animation.
- The hero should not introduce horizontal overflow on mobile or desktop.

## Files

- `src/pages/fan-entry/FanEntryPage.jsx`: remove old effects from first screen, add modal login flow, and render the new hero structure.
- `src/components/effects/CaliburnHeroCanvas.jsx`: new focused canvas component for warm glass orbs with product cores.
- `src/index.css`: add warm fan-entry styles and responsive modal/hero/product-section rules.
- `scripts/ux-smoke.cjs`: extend smoke coverage for the warm luxury hero and modal login behavior.

## Verification

- `node scripts/ux-smoke.cjs`
- `npm run build`
- `node --test src/utils/uwellRoleAccess.test.mjs`
