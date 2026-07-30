import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./FanRulesPage.jsx', import.meta.url), 'utf8');

test('fan rules page separates fixed system logic from configurable parameters', () => {
  assert.match(source, /固定系统逻辑/);
  assert.match(source, /兑换奖励不会降低粉丝等级/);
  assert.match(source, /门店只负责核销，积分由系统发放/);
  assert.match(source, /一个 UWELL 唯一产品码只能被领取一次/);
  assert.match(source, /可配置运营参数/);
  assert.match(source, /每日计分扫码上限/);
  assert.match(source, /社区点赞\/评论\/发帖积分与每日上限/);
  assert.match(source, /需要审核和审计日志/);
  assert.doesNotMatch(source, /Fixed system logic|Configurable operational parameters|Requires review and audit log/);
});

test('fan rules page uses the current AntD Space orientation prop', () => {
  assert.match(source, /<Space orientation="vertical" size=\{6\}>/);
  assert.doesNotMatch(source, /<Space direction="vertical"/);
});
