import { existsSync, readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const migrationPath = new URL('../../../supabase/migrations/20260706000100_reward_pickup_rpc.sql', import.meta.url);
const rewardApiPath = new URL('../services/api/rewards.js', import.meta.url);
const apiBarrelSource = readFileSync(new URL('../services/api.js', import.meta.url), 'utf8');
const storeOwnerSource = readFileSync(new URL('../pages/store-owner/StoreOwnerPage.jsx', import.meta.url), 'utf8');

test('reward pickup RPC migration enforces atomic S-level pickup rules', () => {
  assert.equal(existsSync(migrationPath), true);
  const sql = readFileSync(migrationPath, 'utf8');

  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.confirm_reward_pickup/);
  assert.match(sql, /SECURITY DEFINER/);
  assert.match(sql, /FOR UPDATE/);
  assert.match(sql, /current_store\.level <> 'S'/);
  assert.match(sql, /mall_redemptions[\s\S]+status = 'picked_up'/);
  assert.match(sql, /material_stocks[\s\S]+quantity = GREATEST/);
  assert.match(sql, /material_stocks[\s\S]+qty = GREATEST/);
  assert.match(sql, /INSERT INTO public\.material_outbound/);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.confirm_reward_pickup/);
});

test('frontend exposes remote reward pickup confirmation through Supabase RPC', () => {
  assert.equal(existsSync(rewardApiPath), true);
  const rewardApiSource = readFileSync(rewardApiPath, 'utf8');

  assert.match(rewardApiSource, /confirmRewardPickupRemote/);
  assert.match(rewardApiSource, /\.rpc\('confirm_reward_pickup'/);
  assert.match(rewardApiSource, /p_redeem_code/);
  assert.match(apiBarrelSource, /confirmRewardPickupRemote/);
  assert.match(storeOwnerSource, /confirmRewardPickupRemote/);
});
