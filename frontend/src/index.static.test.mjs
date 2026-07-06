import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8');

test('shared admin and store modals keep readable light form surfaces', () => {
  assert.match(css, /\.ant-modal \.ant-modal-container/);
  assert.match(css, /\.ant-modal \.ant-modal-content/);
  assert.match(css, /\.ant-modal \.ant-modal-footer/);
  assert.match(css, /\.ant-modal \.ant-select-selection-placeholder/);
  assert.match(css, /\.ant-modal \.ant-select-selection-item/);
  assert.match(css, /box-shadow:\s*0 24px 72px/);
  assert.match(css, /\.ant-modal\s*\{\s*background:\s*transparent !important;/);
});
