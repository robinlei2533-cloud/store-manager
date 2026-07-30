import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./languageStore.js', import.meta.url), 'utf8');
const adminAppSource = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8');
const fanAppSource = readFileSync(new URL('../fan/App.jsx', import.meta.url), 'utf8');
const storeAppSource = readFileSync(new URL('../store/App.jsx', import.meta.url), 'utf8');

test('language store keeps portal-specific language defaults and allowed values', () => {
  assert.match(source, /PORTAL_LANGUAGE_CONFIG\s*=\s*\{/);
  assert.match(source, /admin:\s*\{\s*defaultLang:\s*'zh',\s*allowed:\s*\['zh', 'en'\]/);
  assert.match(source, /fan:\s*\{\s*defaultLang:\s*'en',\s*allowed:\s*\['en', 'ar'\]/);
  assert.match(source, /store:\s*\{\s*defaultLang:\s*'en',\s*allowed:\s*\['en', 'ar'\]/);
  assert.match(source, /getPortalStorageKey/);
  assert.match(source, /uwell_lang_\$\{portal\}/);
  assert.doesNotMatch(source, /browserLang === 'zh'/);
  assert.doesNotMatch(source, /browserLang === 'ar'/);
});

test('language store applies RTL direction to document and body for Arabic', () => {
  assert.match(source, /document\.documentElement\.dir = code === 'ar' \? 'rtl' : 'ltr'/);
  assert.match(source, /document\.body\.dir = code === 'ar' \? 'rtl' : 'ltr'/);
  assert.match(source, /document\.body\.dataset\.language = code/);
});

test('missing translation keys fall back to the active portal default language', () => {
  assert.match(source, /getPortalConfig\(activePortal\)\.defaultLang/);
  assert.match(source, /TRANSLATIONS\[fallbackLang\]/);
  assert.match(source, /dict\[key\] \|\| fallbackDict\[key\] \|\| fallback \|\| key/);
});

test('admin portal uses Chinese by default with English as the backup locale', () => {
  assert.match(adminAppSource, /antd\/locale\/zh_CN/);
  assert.match(adminAppSource, /activatePortalLanguage\('admin'\)/);
  assert.match(adminAppSource, /localeMap\s*=\s*\{\s*zh:\s*zhCN,\s*en:\s*enUS\s*\}/);
  assert.doesNotMatch(adminAppSource, /antd\/locale\/ar_EG/);
});

test('fan and store portals remain English Arabic only', () => {
  for (const [label, appSource] of [
    ['fan app', fanAppSource],
    ['store app', storeAppSource],
  ]) {
    assert.match(appSource, /activatePortalLanguage\('(fan|store)'\)/, `${label} should activate its portal language`);
    assert.doesNotMatch(appSource, /antd\/locale\/zh_CN/, `${label} should not import the Chinese AntD locale`);
    assert.match(appSource, /antd\/locale\/en_US/, `${label} should keep English locale`);
    assert.match(appSource, /antd\/locale\/ar_EG/, `${label} should keep Arabic locale`);
  }
});

test('portal Ant Design providers use RTL direction for Arabic', () => {
  for (const [label, appSource] of [
    ['fan app', fanAppSource],
    ['store app', storeAppSource],
  ]) {
    assert.match(
      appSource,
      /direction=\{lang === ['"]ar['"] \? ['"]rtl['"] : ['"]ltr['"]\}/,
      `${label} should pass Arabic RTL direction to Ant Design ConfigProvider`,
    );
  }
});

test('admin Ant Design provider stays left-to-right for Chinese and English', () => {
  assert.match(adminAppSource, /direction="ltr"/);
  assert.doesNotMatch(adminAppSource, /direction=\{lang === ['"]ar['"]/);
});
