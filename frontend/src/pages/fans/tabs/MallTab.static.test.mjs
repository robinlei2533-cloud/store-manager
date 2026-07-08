import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./MallTab.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');

test('redemption success modal uses an isolated readable style scope', () => {
  assert.match(source, /createPendingRedemption/);
  assert.match(source, /createRewardRedemptionRemote/);
  assert.match(source, /pending_pickup/);
  assert.match(source, /S-level UWELL store/);
  assert.match(source, /rewardRules/);
  assert.match(source, /View full redemption rules/);
  assert.match(source, /The code is one-time use/);
  assert.match(source, /I understand/);
  assert.match(source, /className="fan-redemption-modal"/);
  assert.match(source, /className="fan-redemption-status"/);
  assert.match(source, /className="fan-redemption-code"/);
  assert.match(source, /className="fan-redemption-code-value"/);
  assert.match(source, /width=\{420\}/);
  assert.match(css, /\.fan-redemption-modal \.ant-modal-content/);
  assert.match(css, /\.fan-redemption-modal-root \.ant-modal-container/);
  assert.match(css, /\.fan-redemption-status/);
  assert.match(css, /\.fan-redemption-code-value/);
  assert.match(css, /word-break:\s*break-word/);
});

test('redemption success also renders an inline code fallback for pickup closure', () => {
  assert.match(source, /fan-redemption-inline/);
  assert.match(source, /redeemResult && \(/);
  assert.match(source, /Show this code at an S-level UWELL store/);
  assert.match(source, /fan-redemption-code-value/);
  assert.match(css, /\.fan-redemption-inline/);
});

test('redemption code is persisted through fan point refresh rerenders', () => {
  assert.match(source, /getStoredRedeemResult/);
  assert.match(source, /storeRedeemResult/);
  assert.match(source, /sessionStorage\.setItem/);
  assert.match(source, /sessionStorage\.getItem/);
  assert.match(source, /uwell_latest_redemption_/);
  assert.match(source, /setRedeemResult\(result\)/);
});
