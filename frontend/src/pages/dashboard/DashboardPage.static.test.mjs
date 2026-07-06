import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./DashboardPage.jsx', import.meta.url), 'utf8');
const repStart = source.indexOf('if (!isCompanyScope)');
const repEnd = source.indexOf('      </div>', repStart) + '      </div>'.length;
const repBranch = source.slice(repStart, repEnd);

test('field rep dashboard branch is English-first', () => {
  [
    'Field Rep Workspace',
    'My Priorities Today',
    'Responsible Stores',
    'Visit Records',
    'Campaign Execution',
    'Open Complaints',
    'Responsible Store Status',
    'Pending Actions',
    'No pending actions',
    'Recent Visits',
    'My Visit Records',
  ].forEach((label) => assert.ok(repBranch.includes(label), `${label} should be present`));

  assert.doesNotMatch(repBranch, /地推|我的|负责|拜访|活动|待回复|状态|处理|事项|暂无|最近|查看|等级|未评级|门店|客诉/);
});
