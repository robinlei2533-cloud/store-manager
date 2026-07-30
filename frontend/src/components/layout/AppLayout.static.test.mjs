import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./AppLayout.jsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../../App.jsx', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

const cssRuleFor = (selector) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return cssSource.match(new RegExp(`${escapedSelector}\\s*\\{[^}]*\\}`))?.[0] || '';
};

test('staff workspace relies on trial language default without overwriting Arabic', () => {
  assert.doesNotMatch(source, /setLang\('en'\)/);
  assert.doesNotMatch(source, /setLang\('zh'\)/);
  assert.match(source, /LanguageSwitcher/);
});

test('ops sidebar avoids duplicate evaluation menu keys in the rendered admin branch', () => {
  const opsBranch = source.slice(source.indexOf('if (canViewAllCRM) {'), source.indexOf('    } else {'));
  const routeKeyMatches = opsBranch.match(/key: '\/app\/evaluation'/g) || [];

  assert.equal(routeKeyMatches.length, 1);
  assert.match(opsBranch, /key: '\/app\/evaluation\?scope=stores'/);
});

test('mobile admin drawer close button has scoped visible contrast styles', () => {
  assert.match(cssSource, /body\.admin-workspace-active \.ant-drawer \.ant-drawer-close/);
  assert.match(cssSource, /color: #1f1a12 !important/);
  assert.match(cssSource, /background: rgba\(204, 255, 0, 0\.18\) !important/);
  assert.match(cssSource, /body\.admin-workspace-active \.ant-drawer \.ant-drawer-close:focus-visible/);
});

test('admin shell brand subtitle and local mode tag stay at the readable type floor', () => {
  assert.match(cssRuleFor('.admin-ref-brand-sub'), /font-size: 12px;/);
  assert.match(cssRuleFor('.layout-role-tag'), /font-size: 12px !important;/);
});

test('admin route changes reset the scroll position for the workspace content', () => {
  assert.match(source, /contentRef\.current\?\.scrollTo\(\{ top: 0, left: 0/);
  assert.match(source, /window\.scrollTo\(\{ top: 0, left: 0/);
  assert.match(source, /\[location\.pathname, location\.search\]/);
  assert.match(source, /key=\{`\$\{location\.pathname\}\$\{location\.search\}`\}/);
});

test('admin sidebar uses a dedicated scroll area and avoids the old black shell', () => {
  assert.match(source, /className="admin-ref-menu-scroll"/);
  assert.doesNotMatch(source, /background: '#071a2a'/);
  assert.match(source, /<Layout className="admin-ref-main">/);
  assert.match(cssSource, /\.admin-ref-sider \.ant-layout-sider-children/);
  assert.match(cssSource, /height: 100vh/);
  assert.match(cssSource, /position: fixed !important/);
  assert.match(cssSource, /\.admin-liquid-shell \.admin-ref-main/);
  assert.match(cssSource, /margin-left: 260px/);
  assert.match(cssSource, /\.admin-ref-menu-scroll/);
  assert.match(cssSource, /overflow-y: auto/);
  assert.match(cssSource, /rgba\(37, 49, 35, 0\.96\)/);
});

test('admin sidebar exposes the confirmed operations modules', () => {
  assert.match(source, /key: 'stores-module'/);
  assert.match(source, /label: t\('nav_ops_stores'\)/);
  assert.match(source, /key: 'fans-module'/);
  assert.match(source, /label: t\('nav_ops_fans'\)/);
  assert.match(source, /label: t\('nav_campaigns'\)/);
  assert.match(source, /label: t\('nav_ops_rewards'\)/);
  assert.match(source, /label: t\('nav_ops_scan_codes'\)/);
  assert.match(source, /label: t\('nav_ops_materials'\)/);
  assert.match(source, /key: 'field-visits'/);
  assert.match(source, /label: t\('nav_ops_field_visits'\)/);
  assert.match(source, /label: t\('nav_ops_rules'\)/);
  assert.match(source, /label: t\('nav_ops_reviews'\)/);
  assert.match(source, /label: t\('nav_ops_risk_center'\)/);
  assert.match(source, /key: 'settings'/);
  assert.match(source, /profile\.role === ROLES\.ADMIN/);
});

test('stores module exposes S Store Management for operations users', () => {
  assert.match(source, /key: '\/app\/stores\/s-stores'/);
  assert.match(source, /label: t\('nav_s_store_management'\)/);
  assert.match(appSource, /SStoreManagementPage/);
  assert.match(appSource, /path: "stores\/s-stores", element: <ProtectedRoute requiredRole=\{ROLES\.MANAGER\}>/);
});

test('manager sidebar can open audit log without admin-only settings tools', () => {
  assert.match(source, /const settingsChildren = isAdmin/);
  assert.match(source, /key: '\/app\/settings\/audit'/);
  assert.match(source, /canViewOpsScope\(profile\)\) keys\.push\('settings'\)/);
  assert.match(appSource, /path: "settings\/audit", element: <ProtectedRoute requiredRole=\{ROLES\.MANAGER\}>/);
});

test('admin routes include independent rewards, scan codes, rules, reviews, and risk pages', () => {
  assert.match(appSource, /path: "\/app"[\s\S]*<ProtectedRoute requiredRole=\{ROLES\.REP\}>/);
  assert.match(appSource, /RewardsOpsPage/);
  assert.match(appSource, /ScanCodesPage/);
  assert.match(appSource, /OperationalRulesPage/);
  assert.match(appSource, /ReviewsPage/);
  assert.match(appSource, /RiskCenterPage/);
  assert.match(appSource, /path: "rewards"/);
  assert.match(appSource, /path: "scan-codes"/);
  assert.match(appSource, /path: "rules"/);
  assert.match(appSource, /path: "reviews"/);
  assert.match(appSource, /path: "risk-center"/);
});

test('fan operations routes are protected from direct rep URL access', () => {
  assert.match(appSource, /path: "fans\/list", element: <ProtectedRoute requiredRole=\{ROLES\.MANAGER\}>/);
  assert.match(appSource, /path: "fans\/complaints", element: <ProtectedRoute requiredRole=\{ROLES\.MANAGER\}>/);
  assert.match(appSource, /path: "fans\/:id", element: <ProtectedRoute requiredRole=\{ROLES\.MANAGER\}>/);
});

test('field visit module separates new visits, repeat visits, records, rating review, and display data', () => {
  assert.match(source, /label: t\('nav_new_store_visit'\)/);
  assert.match(source, /label: t\('nav_repeat_visit'\)/);
  assert.match(source, /label: t\('nav_visits'\)/);
  assert.match(source, /label: t\('nav_evaluation'\)/);
  assert.match(source, /label: t\('nav_display_data'\)/);
});

test('admin layout has no garbled Chinese shell copy', () => {
  assert.doesNotMatch(source, /[鏂搴鐞濆厜鎺ゅ埗闄堟嵁鎵撳紑鍚庡彴璁剧疆]/);
  assert.match(source, /aria-label=\{t\('admin_open_settings'\)\}/);
  assert.match(source, /label: t\('nav_exposure_control'\)/);
});

test('Task 140 admin shell locks final sidebar contrast and touch target polish', () => {
  assert.match(cssSource, /Task-140: Authorized full follow-up UI finish pass/);
  assert.match(cssSource, /\.admin-liquid-shell \.admin-ref-brand\s*\{[^}]*background:\s*#253123 !important/s);
  assert.match(cssSource, /\.admin-liquid-shell \.admin-ref-logo\s*\{[^}]*color:\s*#17200c !important/s);
  assert.match(cssSource, /\.admin-liquid-shell \.layout-role-tag\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(cssSource, /\.admin-liquid-shell \.ant-menu-item,[\s\S]*\.admin-liquid-shell \.ant-menu-submenu-title\s*\{[^}]*min-height:\s*42px !important/s);
  assert.match(source, /className="layout-role-tag"/);
});
