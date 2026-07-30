import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const checkedFiles = [
  ['FanEntryPage.jsx', '../pages/fan-entry/FanEntryPage.jsx'],
  ['FanCenterPage.jsx', '../pages/fans/FanCenterPage.jsx'],
  ['StoreEntryPage.jsx', '../pages/store-owner/StoreEntryPage.jsx'],
  ['LoginPage.jsx', '../pages/login/LoginPage.jsx'],
  ['AppLayout.jsx', '../components/layout/AppLayout.jsx'],
].map(([label, path]) => [label, readFileSync(new URL(path, import.meta.url), 'utf8')]);

test('portal shells do not reset a saved Arabic language choice back to English', () => {
  for (const [label, source] of checkedFiles) {
    assert.doesNotMatch(source, /setLang\(['"]en['"]\)/, `${label} should not force English after mount`);
    assert.doesNotMatch(source, /ensureEnglishFirst/, `${label} should rely on language store default instead`);
  }
});
