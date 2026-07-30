import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./StoreDetailPage.jsx', import.meta.url), 'utf8');

test('store detail page shows rating and profile copy in Chinese-first backend copy', () => {
  assert.match(source, /当前门店等级/);
  assert.match(source, /最新评级分数/);
  assert.match(source, /系统建议等级/);
  assert.match(source, /门店档案/);
  assert.match(source, /暂无评级/);
  assert.match(source, /[\u4e00-\u9fff]/);
});

test('store detail explains fan exposure readiness and photo linkage', () => {
  assert.match(source, /localDb/);
  assert.match(source, /getStoreExposureScore/);
  assert.match(source, /fan-exposure-readiness-card/);
  assert.match(source, /粉丝曝光准备度/);
  assert.match(source, /门头照片已通过/);
  assert.match(source, /store_front_photo/);
  assert.match(source, /陈列照片已审核/);
  assert.match(source, /粉丝首页推荐/);
  assert.match(source, /粉丝地图高亮/);
  assert.match(source, /奖励领取资格/);
});
