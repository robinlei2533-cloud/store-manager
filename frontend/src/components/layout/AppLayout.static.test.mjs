import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const layoutSource = readFileSync(new URL('./AppLayout.jsx', import.meta.url), 'utf8');
const loginSource = readFileSync(new URL('../../pages/login/LoginPage.jsx', import.meta.url), 'utf8');

test('internal admin surfaces default back to Chinese-first', () => {
  assert.match(layoutSource, /ensureChineseFirst\(\)/);
  assert.match(loginSource, /ensureChineseFirst\(\)/);
});

test('field rep workspace defaults to English while admin stays Chinese-first', () => {
  assert.match(layoutSource, /profile\?\.role === ROLES\.REP \? 'en' : 'zh'/);
  assert.match(layoutSource, /setLang\(defaultWorkspaceLanguage\)/);
});

test('admin language switcher sits before the settings trigger', () => {
  const languageIndex = layoutSource.indexOf('className="layout-header-language"');
  const settingsIndex = layoutSource.indexOf('className={`layout-settings-trigger');

  assert.ok(languageIndex > -1, 'header language switcher should be rendered outside settings panel');
  assert.ok(settingsIndex > -1, 'settings trigger should still exist');
  assert.ok(languageIndex < settingsIndex, 'language switcher should appear to the left of the settings trigger');
  assert.equal(layoutSource.includes('<div className="store-settings-label">{t(\'settings_language\')}</div>'), false);
});

test('field rep navigation labels are English-first', () => {
  assert.match(layoutSource, /Responsible Stores/);
  assert.match(layoutSource, /Campaign Execution/);
  assert.match(layoutSource, /Field Rep Workspace/);
  assert.match(layoutSource, /Fan Complaints/);
  assert.match(layoutSource, /Complaint Replies/);
  assert.doesNotMatch(layoutSource, /负责门店|活动执行|地推工作台|粉丝客诉|客诉回复/);
});
