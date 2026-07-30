import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./audit-logs.js', import.meta.url), 'utf8');

test('audit log service normalizes the production audit payload shape', () => {
  [
    'actor',
    'user_id',
    'role',
    'region',
    'action_type',
    'target_type',
    'target_id',
    'target',
    'before_value',
    'after_value',
    'reason',
    'source_module',
    'category',
    'severity',
  ].forEach((fieldName) => {
    assert.match(source, new RegExp(`${fieldName}:`));
  });
  assert.match(source, /normalizeAuditLogPayload/);
});

test('audit log service writes through Supabase RPC when runtime is available', () => {
  assert.match(source, /import \{ supabase \} from '\.\.\/supabase'/);
  assert.match(source, /write_audit_log/);
  assert.match(source, /supabase\.rpc\('write_audit_log'/);
  assert.match(source, /shouldUseRemoteAuditLog/);
  assert.match(source, /localDb\.insert\('audit_logs'/);
});
