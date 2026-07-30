import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./StoreListPage.jsx', import.meta.url), 'utf8');

test('store list exposes fan-app store exposure controls', () => {
  assert.match(source, /exposureControls/);
  assert.match(source, /fan_home_recommended/);
  assert.match(source, /fan_map_highlighted/);
  assert.match(source, /reward_pickup_recommended/);
  assert.match(source, /store_events_visible/);
  assert.match(source, /risk_downrank/);
  assert.match(source, /hidden_from_fan_app/);
  assert.match(source, /首页推荐/);
  assert.match(source, /地图高亮/);
  assert.match(source, /奖励领取/);
  assert.match(source, /活动露出/);
  assert.match(source, /风险降权/);
  assert.match(source, /粉丝端隐藏/);
  assert.doesNotMatch(source, /Recommended on fan Home/);
  assert.doesNotMatch(source, /A\/S store can still be downranked or hidden/);
});

test('store list records exposure changes in audit logs', () => {
  assert.match(source, /handleExposureToggle/);
  assert.match(source, /audit_logs/);
  assert.match(source, /Store exposure control/);
});

test('store photo review records audit evidence and storefront readiness', () => {
  assert.match(source, /handleReviewStoreDisplay/);
  assert.match(source, /Store photo review/);
  assert.match(source, /storefront_photo_approved/);
  assert.match(source, /store_front_photo/);
});
