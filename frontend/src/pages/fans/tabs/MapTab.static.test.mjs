import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./MapTab.jsx', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');

test('map tab keeps the hero copy compact and image-led', () => {
  assert.match(source, /fan-map-hero/);
  assert.match(source, /fan-map-hero-copy/);
  assert.match(source, /fan-map-hero-visual/);
  assert.doesNotMatch(source, /fan_real_store_map_desc/);
  assert.doesNotMatch(source, /<p>\{t\('fan_real_store_map_desc'\)\}<\/p>/);
  assert.match(cssSource, /\.fan-map-page/);
  assert.match(cssSource, /\.fan-map-hero[\s\S]*min-height:\s*108px/);
  assert.match(cssSource, /\.fan-map-hero-visual[\s\S]*width:\s*min\(100%, 220px\)/);
  assert.match(cssSource, /\.fan-map-hero h2[\s\S]*font-size:\s*22px/);
});

test('map tab tokenizes leaflet marker and popup colors for the yellow green theme', () => {
  assert.match(source, /S:\s*\{\s*labelKey:\s*'fan_real_store_brand_store',\s*className:\s*'is-s'\s*\}/);
  assert.match(source, /fan-map-popup-head/);
  assert.match(source, /fan-map-popup-level/);
  assert.match(source, /fan-map-popup-primary/);
  assert.match(source, /className: `fan-map-marker-wrap \$\{cfg\.className\}/);
  assert.match(source, /<div class="fan-map-marker"/);
  assert.doesNotMatch(source, /background:\$\{cfg\.mark\}/);
  assert.doesNotMatch(source, /border:3px solid/);
  assert.match(cssSource, /\.fan-map-marker-wrap\.is-s/);
  assert.match(cssSource, /\.fan-map-popup-primary/);
  assert.match(cssSource, /--uw-brand-yellow-green:\s*#ccff00/);
});

test('task 135C map page raises markers legend and detail controls to mobile-readable sizes', () => {
  assert.match(cssSource, /Task-135C: Fan Stores readability and service-card rhythm pass/);
  assert.match(cssSource, /\.fan-shell \.fan-map-legend,[\s\S]*\.fan-center-liquid-shell \.fan-map-marker\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(cssSource, /\.fan-shell \.fan-map-hero-score,[\s\S]*\.fan-center-liquid-shell \.fan-map-hero-score\s*\{[^}]*width:\s*104px !important/s);
  assert.match(cssSource, /\.fan-shell \.fan-map-filter-btn,[\s\S]*\.fan-center-liquid-shell \.fan-map-navigate-button\s*\{[^}]*min-height:\s*44px !important/s);
  assert.match(cssSource, /\.fan-shell \.fan-map-canvas-inner,[\s\S]*\.fan-center-liquid-shell \.fan-map-canvas-inner\s*\{[^}]*min-height:\s*360px !important/s);
});
