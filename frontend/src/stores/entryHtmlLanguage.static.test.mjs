import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const entryFiles = [
  ['index.html', '../../index.html'],
  ['fan-app.html', '../../fan-app.html'],
  ['store-app.html', '../../store-app.html'],
  ['public/uwell-fan-login.html', '../../public/uwell-fan-login.html'],
];

test('public entry HTML files default to English document language', () => {
  for (const [label, filePath] of entryFiles) {
    const source = readFileSync(new URL(filePath, import.meta.url), 'utf8');
    assert.match(source, /<html lang="en">/, `${label} should advertise English as the default language`);
    assert.doesNotMatch(source, /lang="zh-CN"/, `${label} should not advertise Chinese as the trial default`);
  }
});
