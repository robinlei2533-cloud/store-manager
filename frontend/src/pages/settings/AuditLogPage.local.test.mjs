import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./AuditLogPage.jsx', import.meta.url), 'utf8');

test('audit log page reads local audit logs during trial mode', () => {
  assert.match(source, /localDb/);
  assert.match(source, /audit_logs/);
  assert.match(source, /员工账号创建/);
  assert.match(source, /门店等级变更/);
  assert.match(source, /Store exposure control/);
  assert.doesNotMatch(source, /Database audit logs are only available in Supabase mode/);
});

test('audit log summary is a flat settings strip instead of nested statistic cards', () => {
  assert.match(source, /className="admin-audit-summary-strip"/);
  assert.match(source, /className="admin-audit-summary-item"/);
  assert.doesNotMatch(source, /<Card\s+size="small">\s*<Statistic/);
  assert.doesNotMatch(source, /<Row[\s\S]*<Col[\s\S]*<Card\s+size="small">[\s\S]*<Statistic/);
});

test('audit log columns match cross-portal minimum fields', () => {
  assert.match(source, /操作人/);
  assert.match(source, /角色/);
  assert.match(source, /区域/);
  assert.match(source, /操作类型/);
  assert.match(source, /对象/);
  assert.match(source, /变更前/);
  assert.match(source, /变更后/);
  assert.match(source, /原因 \/ 备注/);
});

test('audit log page supports trial operations filtering and export', () => {
  assert.match(source, /normalizeAuditLog/);
  assert.match(source, /scopedLogs/);
  assert.match(source, /filteredLogs/);
  assert.match(source, /getAssignedRegion/);
  assert.match(source, /canViewCompanyScope/);
  assert.match(source, /操作类型/);
  assert.match(source, /操作人角色/);
  assert.match(source, /搜索对象、操作人、原因/);
  assert.match(source, /导出CSV/);
});
test('audit log access warning uses AntD title prop instead of deprecated message', () => {
  assert.doesNotMatch(source, /<Alert[\s\S]*message="访问受限"/);
  assert.match(source, /<Alert[\s\S]*title="访问受限"/);
});
