import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./FanCenterPage.jsx', import.meta.url), 'utf8');
const mapSource = readFileSync(new URL('./tabs/MapTab.jsx', import.meta.url), 'utf8');
const rulesSource = readFileSync(new URL('../../utils/uwellLaunchRules.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');
const translationsSource = readFileSync(new URL('../../utils/translations.js', import.meta.url), 'utf8');

test('fan store recommendations are driven by backend exposure controls', () => {
  assert.match(source, /exposure_controls/);
  assert.match(source, /sortStoresForFanExposure/);
  assert.match(source, /fan_home_recommended/);
  assert.match(source, /fan_map_highlighted/);
  assert.match(rulesSource, /getStoreExposureScore/);
  assert.match(rulesSource, /sortStoresForFanExposure\(stores = \[\]\)[\s\S]*getStoreExposureScore/);
  assert.match(rulesSource, /hidden_from_fan_app/);
  assert.match(rulesSource, /risk_downrank/);
  assert.match(rulesSource, /eligible_for_store_events_display/);
});

test('fan store recommendations explain S and A stores get better exposure with compact positive copy', () => {
  assert.doesNotMatch(source, /t\('fan_real_store_map_preview_desc'\)/);
  assert.match(translationsSource, /Find trusted UWELL stores near you/);
  assert.doesNotMatch(source, /Stores with risk or poor service are not recommended to fans/);
  assert.match(rulesSource, /Official UWELL brand experience and premium reward pickup readiness/);
  assert.match(source, /t\('fan_real_map_highlighted'\)/);
  assert.match(source, /presentation\.pickupLabel|t\('fan_real_pickup_eligible'\)/);
  assert.match(source, /t\('fan_real_store_events'\)/);
});

test('fan stores list surfaces storefront photos and visit trust cues from store setup', () => {
  assert.match(source, /getStorefrontPhoto/);
  assert.match(source, /getStorePreviewVisual/);
  assert.match(source, /store_front_photo/);
  assert.match(source, /t\('fan_real_storefront_trust'\)/);
  assert.match(translationsSource, /Storefront photo helps fans recognize this store/);
  assert.match(source, /fan-store-hero-visual/);
  assert.match(source, /fan-store-hero-tags/);
  assert.match(source, /STORE_PREVIEW_HERO_VISUAL/);
  assert.match(source, /fan-refresh-v2\/store-hero\.jpg/);
  assert.match(source, /fan-refresh-v2\/store-s\.jpg/);
  assert.match(source, /fan-refresh-v2\/store-a\.jpg/);
  assert.match(source, /fan-refresh-v2\/store-b\.jpg/);
  assert.match(source, /STORE_FALLBACK_VISUALS/);
  assert.match(source, /STORE_PREVIEW_VISUALS\[3\]/);
  assert.doesNotMatch(source, /fan-refresh\/store-hero\.jpg/);
  assert.match(source, /fan-visible-store-photo-frame/);
  assert.match(source, /fan-visible-store-photo-img/);
  assert.match(source, /fan-visible-store-capability-grid/);
  assert.match(source, /t\('fan_real_activity_store'\)/);
  assert.match(source, /t\('fan_real_pickup_eligible'\)/);
  assert.match(source, /t\('fan_real_display_reviewed'\)/);
  assert.match(source, /t\('fan_real_trust_photo_pending'\)/);
  assert.doesNotMatch(source, /fan_real_store_events'\)\}\n\s*\)\s*;/);
});

test('fan stores list uses unified yellow green chips without default tag colors', () => {
  assert.match(source, /fan-visible-store-chip/);
  assert.match(source, /fan-visible-store-chip is-active/);
  assert.match(source, /is-muted/);
  assert.doesNotMatch(source, /<Tag key=\{capability\.key\} color=\{capability\.active \? 'lime' : 'default'\}>/);
  assert.doesNotMatch(source, /<Tag color="green">Map highlighted<\/Tag>/);
  assert.doesNotMatch(source, /<Tag color="gold">Reward pickup<\/Tag>/);
  assert.doesNotMatch(source, /<Tag color="blue">Store Events<\/Tag>/);
  assert.match(css, /\.fan-visible-store-chip/);
  assert.match(css, /--fan-brand-gradient/);
});

test('fan stores preview reserves space above the fixed bottom nav on mobile', () => {
  assert.match(css, /\.fan-shell \.fan-stores-preview[\s\S]*padding-bottom:\s*calc\(132px \+ env\(safe-area-inset-bottom\)\)/);
});

test('task 135C fan stores preview keeps trust cues visible and readable on mobile', () => {
  assert.match(css, /Task-135C: Fan Stores readability and service-card rhythm pass/);
  assert.match(css, /\.fan-shell \.fan-visible-store-card,[\s\S]*\.fan-center-liquid-shell \.fan-visible-store-card\s*\{[^}]*min-height:\s*132px !important/s);
  assert.match(css, /\.fan-shell \.fan-visible-store-photo,[\s\S]*\.fan-center-liquid-shell \.fan-visible-store-photo\s*\{[^}]*aspect-ratio:\s*4 \/ 3 !important/s);
  assert.match(css, /\.fan-shell \.fan-visible-store-capability-grid span,[\s\S]*\.fan-center-liquid-shell \.fan-visible-store-chip,[\s\S]*\.fan-center-liquid-shell \.fan-map-photo-note\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.fan-shell \.fan-visible-store-capability-grid,[\s\S]*\.fan-center-liquid-shell \.fan-visible-store-capability-grid\s*\{[^}]*display:\s*grid !important/s);
});

test('fan-facing S Store presentation uses safe UWELL Brand Store labels only', () => {
  assert.match(rulesSource, /isActiveSStoreForFans/);
  assert.match(rulesSource, /getFanFacingStorePresentation/);
  assert.match(source, /getFanFacingStorePresentation/);
  assert.match(mapSource, /getFanFacingStorePresentation/);
  assert.match(translationsSource, /fan_real_store_brand_store: 'UWELL Brand Store'/);
  assert.match(mapSource, /fan_real_store_brand_store/);
  assert.match(rulesSource, /Official UWELL brand experience and premium reward pickup readiness/);
  assert.match(rulesSource, /Premium pickup ready/);
  assert.match(mapSource, /presentation\.pickupLabel/);
});

test('fan-facing S Store presentation does not expose backend-only operations', () => {
  const combinedFanSource = `${source}\n${mapSource}`;
  assert.doesNotMatch(combinedFanSource, /sell-through/i);
  assert.doesNotMatch(combinedFanSource, /replenishment/i);
  assert.doesNotMatch(combinedFanSource, /audit/i);
  assert.doesNotMatch(combinedFanSource, /downgrade/i);
  assert.doesNotMatch(combinedFanSource, /s_store_status\s*[}:]/);
  assert.doesNotMatch(combinedFanSource, /s_store_contribution/i);
});
