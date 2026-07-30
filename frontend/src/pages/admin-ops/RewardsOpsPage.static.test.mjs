import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./RewardsOpsPage.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

test('rewards ops keeps core review and pickup operations while avoiding deprecated Space direction', () => {
  assert.match(source, /admin-reward-cockpit/);
  assert.match(source, /admin-reward-review-actions/);
  assert.match(source, /admin-reward-pickup-select/);
  assert.match(source, /updateRedemptionReview\(row, 'approved'\)/);
  assert.match(source, /updateRedemptionReview\(row, 'rejected'\)/);
  assert.match(source, /assignPickupStore\(row\)/);
  assert.doesNotMatch(source, /direction="vertical"/);
  assert.match(source, /orientation="vertical"/);
});

test('rewards ops uses mobile scoped width containment and compressed explanation zones', () => {
  [
    'admin-reward-command-strip',
    'admin-reward-governance-compact',
    'admin-reward-compact-summary',
    'admin-reward-rule-dock',
    'admin-reward-handoff-compact',
    'admin-reward-table-stack',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should remain in the page`));

  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.admin-liquid-shell \.admin-reward-cockpit[\s\S]*overflow-x: hidden/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.admin-liquid-shell \.admin-reward-cockpit > \.ant-card[\s\S]*width: 100% !important/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.admin-liquid-shell \.admin-reward-cockpit \.ant-row[\s\S]*margin-left: 0 !important/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.admin-liquid-shell \.admin-reward-cockpit \.ant-col[\s\S]*width: 100% !important/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.admin-liquid-shell \.admin-reward-governance-compact \.admin-ops-mini-card span[\s\S]*display: none/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.admin-liquid-shell \.admin-reward-compact-summary[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.admin-liquid-shell \.admin-reward-table-stack[\s\S]*width: 100%/);
});

test('rewards ops avoids placeholder image-slot copy in visible governance text', () => {
  assert.doesNotMatch(source, /图片位|占位|鍥剧墖|鍗犱綅/);
  assert.match(source, /目录与素材状态/);
});

test('rewards ops table headers keep a 12px minimum in the admin cockpit', () => {
  assert.match(
    css,
    /\.admin-liquid-shell \.admin-reward-cockpit \.ant-table-thead > tr > th\s*\{[^}]*font-size:\s*12px\s*!important/s,
  );
});
