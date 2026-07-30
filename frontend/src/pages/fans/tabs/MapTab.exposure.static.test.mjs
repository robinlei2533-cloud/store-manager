import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./MapTab.jsx', import.meta.url), 'utf8');
const rulesSource = readFileSync(new URL('../../../utils/uwellLaunchRules.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');
const translationsSource = readFileSync(new URL('../../../utils/translations.js', import.meta.url), 'utf8');

test('fan map uses backend exposure controls for store visibility and ordering', () => {
  assert.match(source, /sortStoresForFanExposure/);
  assert.match(source, /getStoreExposureScore/);
  assert.match(rulesSource, /risk_downrank/);
  assert.match(source, /fan_map_highlighted/);
  assert.match(source, /reward_pickup_recommended/);
  assert.doesNotMatch(source, /HIDDEN_FROM_FAN_APP_CONTROL/);
  assert.doesNotMatch(source, />hidden_from_fan_app/);
  assert.match(source, /className="fan-map-legend"/);
  assert.match(source, /t\('fan_real_map_unavailable_hidden'\)/);
  assert.match(translationsSource, /Unavailable stores are hidden from this list/);
});

test('fan map supports storefront trust photos and uses fan-facing store labels', () => {
  assert.match(source, /t\('fan_real_storefront_photo'\)/);
  assert.match(source, /store_front_photo/);
  assert.match(source, /fan_real_storefront_note/);
  assert.match(source, /STORE_HERO_VISUAL/);
  assert.match(source, /fan-refresh-v2\/store-hero\.jpg/);
  assert.match(source, /STORE_DETAIL_VISUAL/);
  assert.match(source, /fan-refresh-v2\/store-detail\.jpg/);
  assert.match(source, /fan-refresh-v2\/store-s\.jpg/);
  assert.match(source, /fan-refresh-v2\/store-a\.jpg/);
  assert.match(source, /fan-refresh-v2\/store-b\.jpg/);
  assert.match(source, /fan-refresh-v2\/store-c\.jpg/);
  assert.doesNotMatch(source, /fan-refresh\/store-hero\.jpg/);
  assert.match(source, /fan-map-hero-visual/);
  assert.match(source, /getStoreVisual/);
  assert.match(source, /fan-map-store-media/);
  assert.match(source, /fan-map-trust-strip/);
  assert.match(source, /fan-map-gallery-tile/);
  assert.match(source, /selectedGalleryItems/);
  assert.doesNotMatch(source, /fan-map-empty-photo/);
  assert.match(source, /fan-map-filter-btn/);
  assert.match(source, /fan_real_store_brand_store/);
  assert.match(source, /fan_real_store_recommended/);
  assert.match(source, /fan_real_store_listed/);
  assert.doesNotMatch(source, /Platinum/);
  assert.doesNotMatch(source, /Gold/);
  assert.doesNotMatch(source, /Silver/);
  assert.doesNotMatch(source, /Bronze/);
});

test('fan stores map uses unified yellow green discovery styling without default tag colors', () => {
  assert.match(source, /className="fan-map-page"/);
  assert.match(source, /className="fan-map-hero"/);
  assert.match(source, /className="fan-map-filter-row"/);
  assert.match(source, /className=\{`fan-map-filter-btn/);
  assert.match(source, /fan-map-level-chip/);
  assert.match(source, /fan-map-trust-chip/);
  assert.match(source, /fan-map-photo-grid/);
  assert.doesNotMatch(source, /fan-map-empty-photo/);
  assert.match(source, /fan-map-navigate-button/);
  assert.doesNotMatch(source, /<Tag color="green">/);
  assert.doesNotMatch(source, /<Tag color="gold">/);
  assert.doesNotMatch(source, /<Tag color="volcano">/);
  assert.doesNotMatch(source, /background:#1677ff/);
  assert.match(css, /\.fan-map-page/);
  assert.match(css, /\.fan-map-hero/);
  assert.match(css, /\.fan-map-level-chip/);
  assert.match(css, /\.fan-map-trust-chip/);
  assert.match(css, /--fan-brand-gradient/);
});

test('fan map tier filters use custom segmented state without Ant Design white primary artifacts', () => {
  assert.match(source, /aria-pressed=\{!filter\}/);
  assert.match(source, /aria-pressed=\{filter === k\}/);
  assert.doesNotMatch(source, /type=\{!filter \? 'primary' : 'default'\}/);
  assert.doesNotMatch(source, /type=\{filter === k \? 'primary' : 'default'\}/);
  assert.match(css, /\.fan-shell \.fan-map-filter-row[\s\S]*border-radius:\s*var\(--fan-radius-card\)/);
  assert.match(css, /\.fan-shell \.fan-map-filter-btn\.is-active[\s\S]*var\(--fan-brand-gradient\)/);
  assert.match(css, /\.fan-shell \.fan-map-filter-btn span[\s\S]*background:\s*transparent/);
  assert.match(css, /\.fan-shell \.fan-map-filter-btn:active[\s\S]*scale\(0\.98\)/);
});
