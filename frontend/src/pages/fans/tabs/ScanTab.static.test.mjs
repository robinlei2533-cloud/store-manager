import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./ScanTab.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');

test('QR scanner modal uses an isolated readable style scope', () => {
  assert.match(source, /className="fan-scan-modal"/);
  assert.match(source, /rootClassName="fan-scan-modal-root"/);
  assert.match(source, /className="fan-scan-modal-title"/);
  assert.match(source, /className="fan-scan-manual-panel"/);
  assert.match(css, /\.fan-scan-modal \.ant-modal-content/);
  assert.match(css, /\.fan-scan-modal-root \.fan-scan-manual-panel/);
  assert.match(css, /\.fan-scan-manual-copy/);
});
