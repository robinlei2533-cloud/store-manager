import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(process.cwd(), '..');
const bindingPath = resolve(repoRoot, 'supabase/acceptance/preview-identity-binding.sql');
const checksPath = resolve(repoRoot, 'supabase/acceptance/preview-identity-checks.sql');

const readSql = (path) => readFileSync(path, 'utf8').toLowerCase();

describe('Supabase preview identity bindings', () => {
  test('ships SQL files for binding and checking preview identities', () => {
    expect(existsSync(bindingPath)).toBe(true);
    expect(existsSync(checksPath)).toBe(true);
  });

  test('binds every real preview role from Supabase Auth users', () => {
    const sql = readSql(bindingPath);

    [
      'admin@uwell.com',
      'manager@uwell.com',
      'rep1@uwell.com',
      'store.owner@uwell.com',
      'fan.preview@uwell.com',
    ].forEach((email) => {
      expect(sql).toContain(email);
    });

    ['admin', 'manager', 'rep', 'store_owner', 'fan'].forEach((role) => {
      expect(sql).toContain(role);
    });
  });

  test('covers the three RLS ownership bindings required for remote acceptance', () => {
    const sql = readSql(bindingPath);

    expect(sql).toContain('stores.rep_id');
    expect(sql).toContain('stores.owner_profile_id');
    expect(sql).toContain('fans.user_id');
    expect(sql).toContain('504875886');
    expect(sql).toContain('+966501234001');
  });

  test('check SQL verifies auth users, profile roles, and operational bindings', () => {
    const sql = readSql(checksPath);

    expect(sql).toContain('auth.users');
    expect(sql).toContain('profiles');
    expect(sql).toContain('stores');
    expect(sql).toContain('fans');
    expect(sql).toContain('owner_profile_id');
    expect(sql).toContain('rep_id');
    expect(sql).toContain('user_id');
  });
});
