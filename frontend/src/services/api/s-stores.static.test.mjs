import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./s-stores.js', import.meta.url), 'utf8');

test('S Store service reads from dedicated local foundation tables', () => {
  assert.match(source, /localHistory\('s_store_status_history'/);
  assert.match(source, /localHistory\('s_store_sell_through'/);
  assert.match(source, /localHistory\('s_store_product_inventory_snapshots'/);
  assert.match(source, /localHistory\('s_store_material_inventory_snapshots'/);
  assert.match(source, /localHistory\('s_store_visit_details'/);
  assert.match(source, /localDb\.all\('s_store_replenishment_tasks'\)/);
});

test('S Store read services are Supabase-first with local fallback', () => {
  assert.match(source, /import \{ supabase \} from '\.\.\/supabase'/);
  assert.match(source, /import \{[^}]*isLocal[^}]*withFallback[^}]*\} from '\.\/helpers'/s);
  assert.match(source, /supabase\.rpc\('get_internal_stores'/);
  assert.match(source, /supabase\.rpc\('get_internal_store'/);
  assert.match(source, /remoteHistory\('s_store_status_history'/);
  assert.match(source, /remoteHistory\('s_store_sell_through'/);
  assert.match(source, /remoteHistory\('s_store_product_inventory_snapshots'/);
  assert.match(source, /remoteHistory\('s_store_material_inventory_snapshots'/);
  assert.match(source, /remoteHistory\('s_store_visit_details'/);
  assert.match(source, /supabase\.from\('s_store_replenishment_tasks'\)/);
});

test('S Store service keeps page code behind rule and permission boundaries', () => {
  assert.match(source, /isLowStock/);
  assert.match(source, /canStoreSubmitSReport/);
  assert.match(source, /canDowngradeSStore/);
  assert.match(source, /canRestoreSStore/);
  assert.match(source, /canEditLockedHistory/);
  assert.match(source, /recordAuditLog/);
});

test('S Store service exposes V1 read and submission APIs without UI coupling', () => {
  assert.match(source, /export async function getSStores/);
  assert.match(source, /export async function getSStoreDetail/);
  assert.match(source, /export async function getSStoreStatusHistory/);
  assert.match(source, /export async function getSStoreSellThroughHistory/);
  assert.match(source, /export async function getSStoreInventoryHistory/);
  assert.match(source, /export async function getSStoreMaterialInventoryHistory/);
  assert.match(source, /export async function getSStoreVisitDetails/);
  assert.match(source, /export async function getReplenishmentTasks/);
  assert.match(source, /export async function submitSStoreSellThrough/);
  assert.match(source, /export async function submitSStoreInventory/);
  assert.match(source, /export async function submitSStoreMaterialInventory/);
  assert.match(source, /export async function submitSStoreVisitDetail/);
  assert.match(source, /export async function createReplenishmentTask/);
  assert.match(source, /export async function completeReplenishmentTask/);
  assert.match(source, /export async function getSStoreContributionMetrics/);
  assert.match(source, /export async function correctSStoreSellThrough/);
  assert.match(source, /export async function correctSStoreInventory/);
  assert.match(source, /export async function correctSStoreMaterialInventory/);
});

test('S Store service keeps downgraded recovery reads explicit', () => {
  assert.match(source, /includeDowngraded/);
  assert.match(source, /s_store_status === 'downgraded'/);
  assert.match(source, /getSStoreDetail\(storeId, options = \{\}\)/);
});

test('S Store contribution metrics aggregate existing records without manual contribution tables', () => {
  assert.match(source, /localDb\.all\('campaign_claims'\)/);
  assert.match(source, /localDb\.all\('mall_redemptions'\)/);
  assert.match(source, /localDb\.all\('scan_records'\)/);
  assert.match(source, /localDb\.all\('fan_engagement_tasks'\)/);
  assert.match(source, /supabase\.from\('campaign_claims'\)/);
  assert.match(source, /supabase\.from\('mall_redemptions'\)/);
  assert.match(source, /supabase\.from\('scan_records'\)/);
  assert.match(source, /safeOptionalRemoteRows\(\{\s*tableName: 'fan_engagement_tasks'/s);
  assert.match(source, /verifiedActivityCount/);
  assert.match(source, /rewardPickupCount/);
  assert.match(source, /storeScanCount/);
  assert.match(source, /campaignContributionCount/);
  assert.doesNotMatch(source, /localDb\.insert\('s_store_contribution/);
  assert.doesNotMatch(source, /localDb\.all\('s_store_contribution/);
});

test('S Store remote page reads do not let optional sources empty the management list', () => {
  assert.doesNotMatch(source, /select\('\*, stores\(\*\)'\)/);
  assert.match(source, /safeOptionalRemoteRows/);
  assert.match(source, /fan_engagement_tasks/);
  assert.match(source, /optional: true/);
});

test('S Store mutation services call controlled Supabase RPCs outside local mode', () => {
  [
    'submit_s_store_sell_through',
    'submit_s_store_product_inventory',
    'submit_s_store_material_inventory',
    'submit_s_store_visit_detail',
    'create_s_store_replenishment_task',
    'complete_s_store_replenishment_task',
    'downgrade_s_store_to_a',
    'restore_s_store',
    'correct_s_store_sell_through',
    'correct_s_store_product_inventory',
    'correct_s_store_material_inventory',
  ].forEach((rpcName) => {
    assert.match(source, new RegExp(`remoteMutation\\('${rpcName}'`));
  });

  assert.match(source, /remoteMutation\(/);
  assert.match(source, /supabase\.rpc\(rpcName, params\)/);
  assert.match(source, /shouldUseRemoteMutation\(\)/);
  assert.match(source, /if \(!shouldUseRemoteMutation\(\)\) return localSubmitSStoreSellThrough/);
  assert.match(source, /if \(!shouldUseRemoteMutation\(\)\) return localDowngradeSStoreToA/);
  assert.match(source, /if \(!shouldUseRemoteMutation\(\)\) return localCorrectSStoreSellThrough/);
});

test('S Store correction services preserve locked history and require correction metadata', () => {
  assert.match(source, /canCorrectSStoreHistory/);
  assert.match(source, /S Store correction requires a reason/);
  assert.match(source, /corrected_by: profile\.id/);
  assert.match(source, /corrected_at: new Date\(\)\.toISOString\(\)/);
  assert.match(source, /correction_reason: payload\.correction_reason\.trim\(\)/);
  assert.match(source, /locked: true/);
  assert.match(source, /S Store sell-through corrected/);
  assert.match(source, /S Store product inventory corrected/);
  assert.match(source, /S Store material inventory corrected/);
});
