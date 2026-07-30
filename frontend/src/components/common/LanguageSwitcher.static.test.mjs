import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./LanguageSwitcher.jsx', import.meta.url), 'utf8');
const translationsSource = readFileSync(new URL('../../utils/translations.js', import.meta.url), 'utf8');

test('language switcher filters options by active portal language policy', () => {
  assert.match(source, /PORTAL_LANGUAGE_CODES\s*=\s*\{/);
  assert.match(source, /admin:\s*\['zh', 'en'\]/);
  assert.match(source, /fan:\s*\['en', 'ar'\]/);
  assert.match(source, /store:\s*\['en', 'ar'\]/);
  assert.match(source, /activePortal/);
  assert.match(source, /allowedLanguageCodes/);
  assert.match(source, /visibleLanguages\s*=\s*LANGUAGES\.filter/);
  assert.match(source, /visibleLanguages\.map/);
  assert.doesNotMatch(source, /LANGUAGES\.map/);
});

test('language menu closes from outside click and escape instead of staying stuck open', () => {
  assert.match(source, /useEffect/);
  assert.match(source, /useRef/);
  assert.match(source, /switcherRef/);
  assert.match(source, /handlePointerDown/);
  assert.match(source, /handleKeyDown/);
  assert.match(source, /event\.key === 'Escape'/);
  assert.match(source, /document\.addEventListener\('pointerdown', handlePointerDown\)/);
  assert.match(source, /document\.removeEventListener\('pointerdown', handlePointerDown\)/);
  assert.match(source, /document\.addEventListener\('keydown', handleKeyDown\)/);
  assert.match(source, /document\.removeEventListener\('keydown', handleKeyDown\)/);
});

test('language options exported to UI include Chinese English and Arabic', () => {
  assert.match(translationsSource, /export const LANGUAGES = \[/);
  assert.match(translationsSource, /\{ code: 'zh', label: '中文'/);
  assert.match(translationsSource, /\{ code: 'en', label: 'English'/);
  assert.match(translationsSource, /\{ code: 'ar'/);
});
