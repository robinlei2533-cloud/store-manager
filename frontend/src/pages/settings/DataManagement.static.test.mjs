import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./DataManagement.jsx', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

test('data management avoids deprecated AntD alert and space props', () => {
  assert.doesNotMatch(source, /<Alert[^>]*message=/);
  assert.match(source, /title=\{t\('local_demo'\)\}/);
  assert.match(source, /title=\{`\$\{t\('cloud_mode'\)\} \(Supabase\)`\}/);

  assert.doesNotMatch(source, /<Space[^>]*direction="vertical"/);
  assert.match(source, /orientation="vertical"/);
});

test('data management keeps destructive controls while compacting mobile guidance', () => {
  assert.match(source, /handleExport/);
  assert.match(source, /handleImport/);
  assert.match(source, /handleReset/);
  assert.match(source, /handleClearAll/);
  assert.match(source, /admin-settings-data-page/);
  assert.match(source, /admin-settings-cloud-guide/);

  assert.match(cssSource, /\.admin-liquid-shell \.admin-settings-data-page \.admin-settings-cloud-guide\s*\{/);
  assert.match(cssSource, /max-height:\s*260px/);
  assert.match(cssSource, /overflow:\s*hidden/);
});
