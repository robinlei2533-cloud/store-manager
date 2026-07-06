import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(process.cwd(), '..');
const migrationPath = resolve(repoRoot, 'supabase/migrations/20260705000100_rls_role_policies.sql');
const publicPolicyCleanupPath = resolve(repoRoot, 'supabase/migrations/20260705000200_drop_public_trial_policies.sql');

const readMigration = () => readFileSync(migrationPath, 'utf8').toLowerCase();

describe('Supabase RLS role policies', () => {
  test('ships a dedicated RLS migration for preview permission acceptance', () => {
    expect(existsSync(migrationPath)).toBe(true);
  });

  test('defines helper functions for each preview identity boundary', () => {
    const sql = readMigration();

    expect(sql).toContain('current_profile_role');
    expect(sql).toContain('is_admin_or_manager');
    expect(sql).toContain('is_rep_assigned_to_store');
    expect(sql).toContain('is_store_owner');
    expect(sql).toContain('is_fan_owner');
  });

  test('covers the main operational tables with explicit policies', () => {
    const sql = readMigration();
    const requiredTables = [
      'profiles',
      'stores',
      'visits',
      'fans',
      'fan_points_log',
      'fan_checkins',
      'mall_redemptions',
      'scan_records',
      'materials',
      'material_stocks',
      'material_inbound',
      'material_outbound',
      'campaigns',
      'campaign_tasks',
      'campaign_reports',
      'qr_codes',
      'store_evaluations',
      'store_tasks',
    ];

    requiredTables.forEach((table) => {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
      expect(sql).toContain(`on public.${table}`);
    });
  });

  test('keeps anonymous users out of protected CRM tables', () => {
    const sql = readMigration();

    expect(sql).not.toMatch(/to\s+anon/);
    expect(sql).not.toMatch(/to\s+public/);
  });

  test('removes older public trial policies before real preview acceptance', () => {
    expect(existsSync(publicPolicyCleanupPath)).toBe(true);

    const sql = readFileSync(publicPolicyCleanupPath, 'utf8').toLowerCase();

    [
      'profiles_public_fan_read',
      'profiles_public_fan_registration',
      'stores_public_read',
      'stores_public_trial_registration',
      'fans_public_read',
      'fans_public_trial_registration',
    ].forEach((policyName) => {
      expect(sql).toContain(`drop policy if exists ${policyName}`);
    });
  });
});
