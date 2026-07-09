import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./LoginPage.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

test('staff account registration asks for employee name instead of store name', () => {
  assert.match(source, /placeholder=\{t\('staff_name'\)\}/);
  assert.doesNotMatch(source, /placeholder=\{t\('store_name'\)\}/);
});

test('staff account registration offers employee and admin roles only', () => {
  assert.match(source, /t\('set_role_employee'\)/);
  assert.match(source, /value: ROLES\.REP/);
  assert.match(source, /t\('set_role_admin'\)/);
  assert.match(source, /value: ROLES\.ADMIN/);
  assert.doesNotMatch(source, /t\('set_role_fan'\)/);
  assert.doesNotMatch(source, /value: ROLES\.FAN/);
});

test('staff role dropdown has a readable light popup style', () => {
  assert.match(source, /popupClassName="staff-role-select-dropdown"/);
  assert.match(css, /\.staff-role-select-dropdown/);
});
