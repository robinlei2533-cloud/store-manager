import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const pageUrl = new URL('./SStoreDetailPage.jsx', import.meta.url);
const appSource = readFileSync(new URL('../../App.jsx', import.meta.url), 'utf8');

test('S Store Detail page file and protected route exist', () => {
  assert.equal(existsSync(pageUrl), true);
  assert.match(appSource, /SStoreDetailPage/);
  assert.match(appSource, /path: "stores\/s-stores\/:id", element: <ProtectedRoute requiredRole=\{ROLES\.MANAGER\}>/);
});

test('S Store Detail page is a closed-loop operating view without report write forms', () => {
  const source = readFileSync(pageUrl, 'utf8');
  assert.match(source, /S Store Detail/);
  assert.match(source, /UWELL Brand Store detail/);
  assert.match(source, /Back to S Store Management/);
  assert.match(source, /View Store Profile/);
  assert.match(source, /getSStoreDetail/);
  assert.match(source, /getSStoreStatusHistory/);
  assert.match(source, /getSStoreSellThroughHistory/);
  assert.match(source, /getSStoreInventoryHistory/);
  assert.match(source, /getSStoreMaterialInventoryHistory/);
  assert.match(source, /getSStoreVisitDetails/);
  assert.match(source, /getReplenishmentTasks/);
  assert.doesNotMatch(source, /submitSStoreSellThrough/);
  assert.doesNotMatch(source, /submitSStoreInventory/);
});

test('S Store Detail page exposes the required read-only sections', () => {
  const source = readFileSync(pageUrl, 'utf8');
  [
    'Weekly Open-system',
    'Weekly Disposable',
    'Monthly Open-system',
    'Monthly Disposable',
    'Product Low Stock',
    'Material Low Stock',
    'Open Replenishment',
    'Last Visit Status',
    'Status History',
    'Sell-through',
    'Product Inventory',
    'Material Inventory',
    'Field Visit Notes',
    'Replenishment',
    'Contribution',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));
});

test('S Store Detail page exposes guarded status operations through existing services', () => {
  const source = readFileSync(pageUrl, 'utf8');
  assert.match(source, /Status Operations/);
  assert.match(source, /Downgrade to A/);
  assert.match(source, /Restore to S/);
  assert.match(source, /Reason/);
  assert.match(source, /operationReason/);
  assert.match(source, /downgradeSStoreToA/);
  assert.match(source, /restoreSStore/);
  assert.match(source, /queryClient\.invalidateQueries/);
  assert.doesNotMatch(source, /submitSStoreSellThrough/);
  assert.doesNotMatch(source, /submitSStoreInventory/);
});

test('S Store Detail can open downgraded S Stores only for recovery visibility', () => {
  const source = readFileSync(pageUrl, 'utf8');
  assert.match(source, /getSStoreDetail\(id, \{ includeDowngraded: true \}\)/);
  assert.match(source, /s_store_status === 'downgraded'/);
  assert.match(source, /Restore to S/);
  assert.match(source, /Downgraded S Store recovery/);
});

test('S Store Detail exposes replenishment creation and completion through existing services', () => {
  const source = readFileSync(pageUrl, 'utf8');
  assert.match(source, /createReplenishmentTask/);
  assert.match(source, /completeReplenishmentTask/);
  assert.match(source, /Create replenishment task/);
  assert.match(source, /Complete replenishment/);
  assert.match(source, /trigger_source/);
  assert.match(source, /item_type/);
  assert.match(source, /requested_quantity/);
  assert.match(source, /assigned_rep_id/);
  assert.match(source, /completion_photos/);
  assert.match(source, /Completion photos are required/);
  assert.match(source, /replenishmentOperationType/);
  assert.match(source, /queryClient\.invalidateQueries\(\{ queryKey: \['s-store-detail-read-model', id\] \}\)/);
  assert.doesNotMatch(source, /submitSStoreInventory\(.*createReplenishmentTask/s);
  assert.doesNotMatch(source, /submitSStoreVisitDetail\(.*createReplenishmentTask/s);
});

test('S Store Detail exposes contribution metrics from existing fan activity sources', () => {
  const source = readFileSync(pageUrl, 'utf8');
  assert.match(source, /getSStoreContributionMetrics/);
  assert.match(source, /Brand Store Verifications/);
  assert.match(source, /Reward Pickups/);
  assert.match(source, /Store-linked Scans/);
  assert.match(source, /Campaign Contribution/);
  assert.match(source, /verifiedActivityCount/);
  assert.match(source, /rewardPickupCount/);
  assert.match(source, /storeScanCount/);
  assert.match(source, /campaignContributionCount/);
  assert.doesNotMatch(source, /s_store_contribution/);
});

test('S Store Detail exposes guarded correction flows for locked operating history', () => {
  const source = readFileSync(pageUrl, 'utf8');
  assert.match(source, /Correction/);
  assert.match(source, /Correct record/);
  assert.match(source, /correction_reason/);
  assert.match(source, /Correction reason is required/);
  assert.match(source, /correctSStoreSellThrough/);
  assert.match(source, /correctSStoreInventory/);
  assert.match(source, /correctSStoreMaterialInventory/);
  assert.match(source, /canCorrectSStoreHistory/);
  assert.match(source, /openCorrection\('sell-through'/);
  assert.match(source, /openCorrection\('product-inventory'/);
  assert.match(source, /openCorrection\('material-inventory'/);
  assert.match(source, /queryClient\.invalidateQueries\(\{ queryKey: \['s-store-detail-read-model', id\] \}\)/);
});

test('S Store Detail avoids deprecated AntD Space direction prop', () => {
  const source = readFileSync(pageUrl, 'utf8');
  assert.doesNotMatch(source, /<Space[^>]*direction="vertical"/);
  assert.match(source, /orientation="vertical"/);
});
