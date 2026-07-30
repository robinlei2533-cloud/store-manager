import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./ComplaintReplyPage.jsx', import.meta.url), 'utf8');

test('complaint reply page is Chinese-first and scoped to responsible stores', () => {
  assert.match(source, /粉丝投诉回复/);
  assert.match(source, /请输入回复内容/);
  assert.match(source, /投诉已回复/);
  assert.match(source, /暂无粉丝投诉/);
  assert.match(source, /待回复/);
  assert.match(source, /已回复/);
  assert.match(source, /filterByAssignedStores/);
  assert.doesNotMatch(source, /Fan complaint replies|Please enter a reply first|Complaint replied|No fan complaints/);
});
