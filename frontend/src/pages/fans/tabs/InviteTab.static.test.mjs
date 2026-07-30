import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./InviteTab.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');

test('invite tab keeps referral logic while using the recovered fan UI shell', () => {
  assert.match(source, /buildReferralCode/);
  assert.match(source, /INVITE_REWARD_POINTS = 50/);
  assert.match(source, /navigator\.clipboard\.writeText/);
  assert.match(source, /fan-invite-shell/);
  assert.match(source, /fan-invite-hero/);
  assert.match(source, /fan-invite-code-card/);
  assert.match(source, /fan-invite-stat-grid/);
  assert.match(source, /fan-invite-rule-note/);
  assert.doesNotMatch(source, /liquid-glass/);
  assert.match(css, /\.fan-invite-shell/);
  assert.match(css, /\.fan-invite-hero/);
  assert.match(css, /\.fan-invite-code-card/);
});
