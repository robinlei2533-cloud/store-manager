import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./UserManagementPage.jsx', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

test('admin user management includes staff account creation with restricted roles and real email validation', () => {
  assert.match(source, /员工账号管理/);
  assert.match(source, /临时密码/);
  assert.match(source, /角色仅限 Manager 或 Rep/);
  assert.match(source, /isValidBusinessEmail/);
  assert.match(source, /123@123/);
  assert.match(source, /value: 'manager'/);
  assert.match(source, /value: 'rep'/);
  assert.doesNotMatch(source, /value: 'admin'/);
});

test('admin user table uses account semantics and mobile-safe horizontal access', () => {
  assert.match(source, /title: '员工'/);
  assert.match(source, /title: '联系方式'/);
  assert.match(source, /title: '角色'/);
  assert.match(source, /title: '角色调整'/);
  assert.doesNotMatch(source, /title: t\('store_name'\)/);
  assert.doesNotMatch(source, /title: t\('store_phone'\)/);
  assert.match(source, /className="admin-settings-users-table"/);
  assert.match(source, /scroll=\{\{ x: 560 \}\}/);
  assert.match(source, /updateMutation\.mutate\(\{ id: record\.id, profile: \{ role: v \} \}\)/);
});

test('admin user management form labels stay readable on light settings cards', () => {
  assert.match(source, /admin-settings-users-table/);
  assert.match(cssSource, /\.admin-liquid-shell \.admin-settings-page/);
  assert.match(cssSource, /\.admin-liquid-shell \.admin-settings-page \.ant-form-item-label > label\s*\{[^}]*color:\s*rgba\(36,\s*28,\s*16,\s*0\.82\)/s);
  assert.match(cssSource, /font-weight:\s*700/);
  assert.match(cssSource, /\.admin-liquid-shell \.admin-settings-page \.ant-form-item-extra\s*\{[^}]*color:\s*rgba\(36,\s*28,\s*16,\s*0\.64\)/s);
});

test('admin settings table headers keep a 12px minimum font size', () => {
  assert.match(
    cssSource,
    /\.admin-liquid-shell \.admin-settings-page \.ant-table-thead > tr > th\s*\{[^}]*font-size:\s*12px\s*!important/s,
  );
});
