import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./HowItWorksTab.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');
const translationsSource = readFileSync(new URL('../../../utils/translations.js', import.meta.url), 'utf8');

test('guide tab is a lightweight onboarding guide for the four earning channels', () => {
  assert.match(source, /fan-guide-shell/);
  assert.match(source, /fan-guide-hero/);
  assert.match(source, /fan-guide-channel-grid/);
  assert.match(source, /fan-guide-support-row/);
  assert.match(source, /t\('fan_real_help_scan_question'\)/);
  assert.match(source, /t\('fan_real_help_checkin_question'\)/);
  assert.match(source, /t\('fan_real_help_activities_question'\)/);
  assert.match(source, /t\('fan_real_help_community_question'\)/);
  assert.match(source, /t\('fan_real_help_invite_question'\)/);
  assert.match(source, /t\('fan_real_help_existing_fan_question'\)/);
  assert.doesNotMatch(source, /liquid-glass/);
  assert.match(css, /\.fan-guide-shell/);
  assert.match(css, /\.fan-guide-hero/);
  assert.match(css, /\.fan-guide-channel-grid/);
});

test('guide page uses short support copy instead of dense rule paragraphs', () => {
  assert.match(source, /t\('fan_real_help_levels_answer'\)/);
  assert.match(translationsSource, /Levels grow from lifetime points; rewards spend available points only\./);
  assert.match(source, /t\('fan_real_help_more_desc'\)/);
  assert.match(translationsSource, /Need help with scan, pickup, or rewards\? Send details and the team will check\./);
  assert.doesNotMatch(source, /Bronze: 0, Silver: 300, Gold: 1000, Diamond: 5000 lifetime growth points/);
  assert.doesNotMatch(source, /Redeeming rewards spends available points only and never downgrades your level/);
});
