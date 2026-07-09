import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./DashboardPage.jsx', import.meta.url), 'utf8');
const repStart = source.indexOf('if (!isCompanyScope)');
const repEnd = source.indexOf('      </div>', repStart) + '      </div>'.length;
const repBranch = source.slice(repStart, repEnd);

test('field rep dashboard branch uses translated labels instead of English-first copy', () => {
  [
    "t('rep_workspace')",
    "t('rep_priorities_today')",
    "t('rep_responsible_stores')",
    "t('rep_visit_records')",
    "t('rep_campaign_execution')",
    "t('rep_open_complaints')",
    "t('rep_store_status')",
    "t('rep_pending_actions')",
    "t('rep_no_pending_actions')",
    "t('dash_recent_visits')",
    "t('rep_my_visit_records')",
  ].forEach((label) => assert.ok(repBranch.includes(label), `${label} should be present`));

  assert.doesNotMatch(repBranch, />Field Rep Workspace</);
  assert.doesNotMatch(repBranch, />My Priorities Today</);
  assert.doesNotMatch(repBranch, /No pending actions/);
});
