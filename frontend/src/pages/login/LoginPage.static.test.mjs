import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./LoginPage.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

test('backend login page is login-only and has no public staff registration', () => {
  assert.match(source, /const \{ user, profile, loading, signIn \} = useAuthStore\(\)/);
  assert.match(source, /STAFF_ROLES/);
  assert.match(source, /profile\?\.role/);
  assert.match(source, /assignedAccountSummary/);
  assert.match(source, /\\u5458\\u5de5\\u8d26\\u53f7\\u7531\\u7ba1\\u7406\\u5458\\u7edf\\u4e00\\u5206\\u914d/);
  assert.match(source, /\\u7cfb\\u7edf\\u8bbe\\u7f6e > \\u7528\\u6237\\u7ba1\\u7406/);
  assert.doesNotMatch(source, /setLang\('en'\)/);
  assert.doesNotMatch(source, /signUp/);
  assert.doesNotMatch(source, /registerModalOpen/);
  assert.doesNotMatch(source, /handleRegister/);
  assert.doesNotMatch(source, /create_staff_account/);
  assert.doesNotMatch(source, /value: ROLES\.ADMIN/);
});

test('backend login uses the yellow-green staff theme instead of black-gold', () => {
  assert.match(source, /staff-login-green-theme/);
  assert.match(css, /staff-login-green-theme[\s\S]*--login-acid: #ccff00/);
  assert.match(css, /staff-login-green-theme[\s\S]*--login-green: #7ee000/);
  assert.match(css, /staff-login-green-theme[\s\S]*background:[\s\S]*#f8ffe8/);
  assert.match(css, /staff-login-green-theme \.ant-alert-title[\s\S]*color: var\(--login-ink\)/);
  assert.doesNotMatch(css, /staff-login-green-theme[\s\S]*#FFD700/);
});

test('backend login keeps the operations title readable without decorative blur motion', () => {
  assert.doesNotMatch(source, /BlurText/);
  assert.match(source, /className="staff-login-heading[^"]*"/);
});

test('backend assigned-account reminder is collapsed by default', () => {
  assert.match(source, /<details className="staff-login-notice-fold"/);
  assert.match(source, /<summary>\{assignedAccountSummary\}<\/summary>/);
  assert.doesNotMatch(source, /type="warning"[\s\S]*assignedAccountSummary/);
  assert.match(css, /staff-login-notice-fold/);
});

test('backend login alert uses AntD title prop instead of deprecated message', () => {
  assert.doesNotMatch(source, /<Alert[\s\S]*message=\{t\('local_demo'\)\}/);
  assert.match(source, /<Alert[\s\S]*title=\{t\('local_demo'\)\}/);
});

test('task 141 backend login uses restrained ReactBits-inspired form interactions', () => {
  assert.match(source, /Task-141 ReactBits-inspired staff login polish/);
  assert.match(source, /className="staff-login-heading uw-reactbits-split-text"/);
  assert.match(source, /className="staff-login-card liquid-glass-strong uw-reactbits-fade-content"/);
  assert.match(source, /className="staff-login-field uw-reactbits-field"/);
  assert.match(source, /className="login-btn-primary uw-reactbits-specular-button"/);
  assert.match(css, /\.staff-login-page \.staff-login-field \.ant-input-affix-wrapper\s*\{[^}]*min-height:\s*44px !important/s);
});

test('task 149 backend login keeps assigned-account copy readable and tap targets trial-safe', () => {
  assert.doesNotMatch(source, /鍛樺伐|绯荤粺|鐢ㄦ埛|璐﹀彿|娉ㄥ唽|鑷|寤/);
  assert.match(css, /\.staff-login-page \.staff-login-field \.ant-input-affix-wrapper,[\s\S]*\.staff-login-page \.login-btn-primary\s*\{[^}]*min-height:\s*44px !important/s);
});
