import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const inboundSource = readFileSync(new URL('./MaterialInboundPage.jsx', import.meta.url), 'utf8');
const outboundSource = readFileSync(new URL('./MaterialOutboundPage.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

test('material inbound history keeps mobile readability with scoped table containment', () => {
  assert.match(inboundSource, /admin-material-inbound-page/);
  assert.match(inboundSource, /admin-material-inbound-form-card/);
  assert.match(inboundSource, /admin-material-inbound-table/);
  assert.match(inboundSource, /scroll=\{\{ x: 760 \}\}/);
  assert.match(inboundSource, /layout="inline"/);
  assert.match(inboundSource, /createInbound/);

  assert.match(css, /\.admin-liquid-shell \.admin-material-inbound-page/);
  assert.match(css, /\.admin-liquid-shell \.admin-material-inbound-table \.ant-table-cell/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.admin-liquid-shell \.admin-material-inbound-page[\s\S]*padding: 12px !important/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.admin-liquid-shell \.admin-material-inbound-form-card \.ant-form-item-label > label[\s\S]*color: #1f1a12/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.admin-liquid-shell \.admin-material-inbound-table \.ant-table-cell[\s\S]*white-space: nowrap/);
});

test('material outbound records keep approval actions contained on mobile', () => {
  assert.match(outboundSource, /admin-material-outbound-page/);
  assert.match(outboundSource, /admin-material-outbound-tabs/);
  assert.match(outboundSource, /admin-material-outbound-form/);
  assert.match(outboundSource, /admin-material-outbound-records-table/);
  assert.match(outboundSource, /scroll=\{\{ x: 920 \}\}/);
  assert.match(outboundSource, /aria-label="Approve outbound"/);
  assert.match(outboundSource, /aria-label="Reject outbound"/);
  assert.match(outboundSource, /aria-label="Mark outbound delivered"/);
  assert.match(outboundSource, /updateOutboundStatus/);
  assert.match(outboundSource, /status:\s*'approved'/);
  assert.match(outboundSource, /status:\s*'rejected'/);
  assert.match(outboundSource, /status:\s*'delivered'/);

  assert.match(css, /\.admin-liquid-shell \.admin-material-outbound-page/);
  assert.match(css, /\.admin-liquid-shell \.admin-material-outbound-tabs/);
  assert.match(css, /\.admin-liquid-shell \.admin-material-outbound-records-table \.ant-table-cell/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.admin-liquid-shell \.admin-material-outbound-records-table \.ant-btn\[aria-label\][\s\S]*width: 32px/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.admin-liquid-shell \.admin-material-outbound-tabs \.ant-form-item-label > label[\s\S]*color: #1f1a12/);
});
