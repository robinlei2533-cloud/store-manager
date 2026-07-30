import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const inviteSource = readFileSync(new URL('./InviteTab.jsx', import.meta.url), 'utf8');
const guideSource = readFileSync(new URL('./HowItWorksTab.jsx', import.meta.url), 'utf8');
const translationsSource = readFileSync(new URL('../../../utils/translations.js', import.meta.url), 'utf8');

test('invite and guide copy use confirmed fan point rules', () => {
  assert.match(inviteSource, /INVITE_REWARD_POINTS\s*=\s*50/);
  assert.match(inviteSource, /t\('fan_real_invite_earn'\)/);
  assert.match(translationsSource, /fan_real_invite_earn: 'Earn 50 Points'/);
  assert.doesNotMatch(inviteSource, /30 points/i);

  assert.match(guideSource, /t\('fan_real_help_scan_question'\)/);
  assert.match(guideSource, /t\('fan_real_help_checkin_question'\)/);
  assert.match(guideSource, /t\('fan_real_help_activities_question'\)/);
  assert.match(guideSource, /t\('fan_real_help_community_question'\)/);
  assert.match(guideSource, /t\('fan_real_help_existing_fan_question'\)/);
  assert.match(translationsSource, /bonus points after backend review/);
  assert.match(translationsSource, /Diamond starts at 5000/);
  assert.doesNotMatch(guideSource, /5 levels/);
  assert.doesNotMatch(guideSource, /Platinum/);
  assert.doesNotMatch(guideSource, /\+30/);
});

test('guide tab keeps the visual weight on the four earning channels and a compact support row', () => {
  assert.match(guideSource, /fan-guide-support-row/);
  assert.match(guideSource, /fan_real_help_levels_answer/);
  assert.match(guideSource, /fan_real_help_existing_fan_answer/);
  assert.match(guideSource, /fan_real_help_scan_question/);
  assert.match(guideSource, /fan_real_help_invite_question/);
  assert.doesNotMatch(guideSource, /fan_real_help_levels_question.*fan-guide-channel-grid/);
  assert.doesNotMatch(guideSource, /fan_real_help_existing_fan_question.*fan-guide-channel-grid/);
});
