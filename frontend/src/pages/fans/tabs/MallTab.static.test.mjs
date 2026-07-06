import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./MallTab.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');

test('redemption success modal uses an isolated readable style scope', () => {
  assert.match(source, /createPendingRedemption/);
  assert.match(source, /pending_pickup/);
  assert.match(source, /S-level UWELL store/);
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
