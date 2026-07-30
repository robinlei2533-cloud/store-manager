import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8');
const viteConfig = readFileSync(new URL('../vite.config.js', import.meta.url), 'utf8');

test('task 149 accepts current vendor chunk scale without hiding build failures', () => {
  assert.match(viteConfig, /chunkSizeWarningLimit:\s*1500/);
  assert.match(viteConfig, /manualChunks\(id\)/);
  assert.doesNotMatch(viteConfig, /npm install|visualizer|sourcemap:\s*true/);
});

test('task 149 raises store microcopy and home action targets from readiness QA findings', () => {
  assert.match(css, /Task-149: trial-readiness tap targets and microcopy readability/);
  assert.match(css, /\.store-liquid-shell \.store-level-compact-action span,[\s\S]*font-size:\s*12px !important/s);
  assert.match(css, /\.store-liquid-shell \.store-home-row-meta,/);
  assert.match(css, /\.store-liquid-shell \.store-stock-row span,/);
  assert.match(css, /\.store-liquid-shell \.store-photo-material-workbench \.ant-tag,/);
  assert.match(css, /\.store-liquid-shell \.store-home-data-row \.ant-btn,[\s\S]*min-height:\s*44px !important/s);
  assert.match(css, /\.store-liquid-shell \.store-dashboard-section \.ant-card-extra \.ant-btn,/);
  assert.match(css, /\.store-liquid-shell \.store-stock-row \.ant-btn,/);
});

test('task 149 raises admin dashboard summaries pagination and staff action targets', () => {
  assert.match(css, /\.admin-liquid-shell \.admin-command-summary-label,[\s\S]*font-size:\s*12px !important/s);
  assert.match(css, /\.admin-liquid-shell \.admin-action-priority,/);
  assert.match(css, /\.admin-liquid-shell \.admin-readiness-card span,/);
  assert.match(css, /\.admin-liquid-shell \.dash-stat-label,/);
  assert.match(css, /\.admin-liquid-shell \.recharts-text,/);
  assert.match(css, /\.admin-liquid-shell \.ant-pagination-item,[\s\S]*min-width:\s*36px !important/s);
  assert.match(css, /\.admin-liquid-shell \.admin-settings-page \.ant-btn-primary,[\s\S]*min-height:\s*44px !important/s);
  assert.match(css, /\.admin-liquid-shell \.admin-review-workbench \.ant-btn,/);
  assert.match(css, /\.admin-liquid-shell \.leaflet-control-zoom a\s*\{[^}]*width:\s*36px !important/s);
  assert.match(css, /Task-150: final Admin Dashboard visible microcopy floor/);
  assert.match(css, /\.admin-liquid-shell \.dashboard-page \.ant-tag,[\s\S]*font-size:\s*12px !important/s);
  assert.match(css, /\.admin-liquid-shell \.ant-tag,/);
  assert.match(css, /\.admin-liquid-shell \.ant-table-cell,/);
  assert.match(css, /\.admin-liquid-shell \.dashboard-page \.ant-table-cell,/);
});
