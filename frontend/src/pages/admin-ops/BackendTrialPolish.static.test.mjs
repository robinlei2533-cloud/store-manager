import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), 'utf8');

describe('Task-090 backend trial table polish', () => {
  it('keeps S Store Management table inside the shared trial scroll frame', () => {
    const source = read('src/pages/stores/SStoreManagementPage.jsx');

    assert.match(source, /className="s-store-table-scroll-region"/);
    assert.match(source, /className="admin-trial-wide-table"/);
    assert.match(source, /scroll=\{\{\s*x:\s*2360\s*\}\}/);
    assert.match(source, /tableLayout="fixed"/);
  });

  it('adds explicit mobile-safe horizontal table scroll to Reviews and Rewards ops', () => {
    const reviews = read('src/pages/admin-ops/ReviewsPage.jsx');
    const rewards = read('src/pages/admin-ops/RewardsOpsPage.jsx');

    assert.match(reviews, /className="admin-trial-wide-table"/);
    assert.match(reviews, /scroll=\{\{\s*x:\s*980\s*\}\}/);
    assert.match(rewards, /className="admin-trial-wide-table"/);
    assert.match(rewards, /scroll=\{\{\s*x:\s*920\s*\}\}/);
    assert.match(rewards, /scroll=\{\{\s*x:\s*1100\s*\}\}/);
  });

  it('defines shared trial table affordance CSS for wide backend tables', () => {
    const css = read('src/index.css');

    assert.match(css, /\.admin-liquid-shell \.admin-trial-wide-table/);
    assert.match(css, /overflow-x:\s*auto/);
    assert.match(css, /-webkit-overflow-scrolling:\s*touch/);
    assert.match(css, /横向滑动/);
  });
});
