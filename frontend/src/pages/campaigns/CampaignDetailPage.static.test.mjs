import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./CampaignDetailPage.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

test('campaign detail keeps descriptions readable on mobile', () => {
  assert.match(source, /<Descriptions column=\{\{ xs: 1, sm: 1, md: 2, lg: 3 \}\} bordered>/);
  assert.match(source, /<Col xs=\{24\} sm=\{12\} md=\{8\} key=\{s\.id\}>/);
  assert.match(source, /className="campaign-store-tag"/);
  assert.match(css, /\.campaign-store-tag/);
  assert.match(css, /white-space:\s*normal !important/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.match(css, /\.admin-liquid-shell \.ant-descriptions-item-label/);
  assert.match(css, /color:\s*#6b6256 !important/);
  assert.match(css, /\.admin-liquid-shell \.ant-descriptions-item-content \*/);
  assert.match(css, /color:\s*#2a2115 !important/);
});
