import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./FanDetailPage.jsx', import.meta.url), 'utf8');

test('fan detail page passes operator scope and handles restricted fan access', () => {
  assert.match(source, /useAuthStore/);
  assert.match(source, /const profile = useAuthStore/);
  assert.match(source, /getFanById\(id, \{ scopeProfile: profile \}\)/);
  assert.match(source, /访问受限/);
  assert.match(source, /粉丝不存在或不在当前账号可查看范围内/);
});

test('fan detail page uses Chinese admin shell copy', () => {
  [
    '返回粉丝列表',
    '粉丝详情',
    '姓名',
    '门店',
    '等级',
    '积分',
    '总贡献',
    '当前权益',
    '积分记录',
    '等级规则',
    '日期',
    '类型',
    '来源',
    '说明',
    '获得',
    '兑换',
    '暂无积分记录',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));

  assert.doesNotMatch(source, /Back to Fans|Fan Detail|Access Restricted|outside your access scope|Points History|Level Info|Current Benefits|Earned|Redeemed|No points history/);
});

test('fan detail page keeps mobile details and history table readable', () => {
  const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.match(source, /admin-fan-detail-page/);
  assert.match(source, /className="admin-fan-detail-descriptions"/);
  assert.match(source, /className="admin-trial-wide-table admin-fan-detail-history-table"/);
  assert.match(source, /scroll=\{\{ x:\s*680 \}\}/);

  assert.match(css, /\.admin-liquid-shell \.admin-fan-detail-page/);
  assert.match(css, /\.admin-liquid-shell \.admin-fan-detail-descriptions/);
  assert.match(css, /\.admin-liquid-shell \.admin-fan-detail-history-table/);
  assert.match(css, /横向滑动/);
});
