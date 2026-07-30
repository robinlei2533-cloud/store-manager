import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./StoreListPage.jsx', import.meta.url), 'utf8');

test('admin store list uses Chinese shell labels without removing key actions', () => {
  [
    '城市',
    '国家',
    '最新评级',
    '去评分',
    '查看详情',
    '负责地推',
    '指定地推',
    '评分',
    '我的负责门店',
    '正常',
    '待审核',
    '停用',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));

  assert.doesNotMatch(source, /placeholder="Country"|placeholder="City"|placeholder="Status"|title: 'City'|title: 'Latest Rating'|title: 'Responsible Rep'|>Rate Now<|View Details|Assign Rep|>Rate</);
  assert.doesNotMatch(source, /闂|璐|鍘|鏌|绾|鎸|鑱|鐢|杩/);
});

test('admin store list gives the main wide table a mobile scroll affordance', () => {
  const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.ok(source.includes('admin-store-list-wide-table'), 'main store list table should have a scoped wide table wrapper');
  assert.match(source, /className="admin-trial-wide-table admin-store-list-wide-table"/);
  assert.match(source, /scroll=\{\{ x:\s*1170 \}\}/);

  assert.match(css, /\.admin-liquid-shell \.admin-store-list-wide-table/);
  assert.match(css, /横向滑动/);
});

test('admin store list uses compact Chinese review and exposure controls', () => {
  const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  [
    'admin-store-review-grid',
    'admin-store-review-card',
    'admin-store-exposure-card',
    'admin-store-exposure-actions',
    'admin-store-exposure-button',
    'admin-store-exposure-note',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));

  [
    '首页推荐',
    '地图高亮',
    '奖励领取',
    '活动露出',
    '风险降权',
    '粉丝端隐藏',
    '通过',
    '拒绝',
    '粉丝端曝光控制',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));

  assert.doesNotMatch(source, /Recommended on fan Home|Highlighted on fan map|Eligible for reward pickup recommendation|Eligible for Store Events display|Risk downrank|Hidden from fan app/);

  assert.match(css, /\.admin-liquid-shell \.admin-store-review-grid/);
  assert.match(css, /\.admin-liquid-shell \.admin-store-review-card/);
  assert.match(css, /\.admin-liquid-shell \.admin-store-exposure-card/);
  assert.match(css, /\.admin-liquid-shell \.admin-store-exposure-actions/);
  assert.match(css, /\.admin-liquid-shell \.admin-store-exposure-button/);
  assert.match(css, /\.admin-liquid-shell \.admin-store-exposure-note/);
});

test('admin store list avoids deprecated AntD Space direction prop', () => {
  assert.doesNotMatch(source, /<Space[^>]*direction="vertical"/);
  assert.match(source, /orientation="vertical"/);
});
