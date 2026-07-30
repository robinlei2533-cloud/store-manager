import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./ScanTab.jsx', import.meta.url), 'utf8');
const translationsSource = readFileSync(new URL('../../../utils/translations.js', import.meta.url), 'utf8');

test('scan tab uses shared UWELL code classification and unique-code anti-fraud copy', () => {
  assert.match(source, /classifyScanResult/);
  assert.match(source, /product_unique/);
  assert.match(source, /already_claimed/);
  assert.match(source, /suspicious/);
  assert.match(source, /unverified_preview_only/);
  assert.match(source, /hasServerValidation: Boolean\(resolved\.matchedQr\)/);
  assert.match(source, /Official UWELL code validation is required/);
  assert.match(source, /Official UWELL code validation is required before product scan points can be awarded/);
  assert.match(source, /validator_source/);
  assert.match(source, /decision_reason/);
  assert.match(source, /validation_mode/);
  assert.match(source, /Number\(record\.points_earned \|\| 0\) > 0 \|\| record\.validation_mode === 'trial_admin_code_library'/);
  assert.match(source, /t\('fan_real_daily_limit'\)/);
  assert.match(source, /t\('fan_real_scan_not_eligible_title'\)/);
});

test('scan modal keeps translation function in hook dependency arrays', () => {
  assert.match(source, /const startCamera = useCallback\(async \(\) => \{[\s\S]*\}, \[t\]\);/);
  assert.match(source, /useEffect\(\(\) => \{[\s\S]*fan_real_scan_not_supported[\s\S]*\}, \[open, initialManual, scanLimitReached, startCamera, stopCamera, t\]\);/);
});

test('scan tab explains supported UWELL code types beyond product QR codes', () => {
  assert.match(source, /t\('fan_real_scan_store_event'\)/);
  assert.match(source, /t\('fan_real_scan_activity_code'\)/);
  assert.match(source, /t\('fan_real_scan_entry_code'\)/);
  assert.match(translationsSource, /website \/ social \/ community/i);
});

test('daily scan limit blocks points but not code recognition', () => {
  assert.match(source, /todayCountedProductScans/);
  assert.match(source, /OPERATIONAL_RULE_RECORD_ID/);
  assert.match(source, /mergeOperationalRules/);
  assert.match(source, /operationalRules\.dailyScanLimit/);
  assert.match(source, /operationalRules\.scanPoints/);
  assert.match(source, /ruleSettings: operationalRules/);
  assert.match(source, /t\('fan_real_scan_limit_note'\)/);
  assert.match(source, /t\('fan_real_scan_anyway'\)/);
  assert.match(translationsSource, /fan_real_scan_anyway: 'Scan anyway \(no more points today\)'/);
  assert.doesNotMatch(source, /disabled=\{scansRemaining <= 0\}/);
});

test('scan tab presents a lighter fan-friendly scan surface and folded code class matrix', () => {
  assert.match(source, /fan-scan-focus-hero/);
  assert.match(source, /fan-scan-visual-stage/);
  assert.match(source, /fan-scan-status-strip/);
  assert.match(source, /fan-scan-rules-drawer/);
  assert.match(source, /fan-scan-code-matrix is-folded/);
  assert.match(source, /fan-scan-code-card/);
  assert.match(source, /fan-scan-result-panel/);
  assert.match(source, /t\('fan_real_scan_product_unique'\)/);
  assert.match(source, /t\('fan_real_scan_desc'\)/);
  assert.match(translationsSource, /Unique product codes add points/);
  assert.match(translationsSource, /Other UWELL codes confirm activity/);
  assert.match(source, /t\('fan_real_scan_non_uwell'\)/);
  assert.match(source, /t\('fan_real_scan_remaining'\)/);
});

test('scan tab keeps manual entry visible and passes the real daily limit state to the modal', () => {
  assert.match(source, /fan-scan-action-grid/);
  assert.match(source, /t\('fan_real_enter_code'\)/);
  assert.match(translationsSource, /fan_real_enter_code: 'Enter code manually'/);
  assert.match(source, /initialManual/);
  assert.match(source, /openScanner\('manual'\)/);
  assert.match(source, /scanLimitReached=\{scansRemaining <= 0\}/);
});

test('scan tab renders recent scan records with status-focused UI copy', () => {
  assert.match(source, /fan-scan-recent-list/);
  assert.match(source, /fan-scan-recent-item/);
  assert.match(source, /scan_status/);
  assert.match(source, /points_earned/);
  assert.match(source, /t\('fan_real_no_product_points'\)/);
});

test('scan modal uses the unified yellow-green fan visual system instead of inline yellow styling', () => {
  const css = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');
  assert.match(source, /className="fan-scan-camera-viewport"/);
  assert.match(source, /className="fan-scan-camera-video"/);
  assert.match(source, /className="fan-scan-camera-spinner"/);
  assert.match(source, /className="fan-scan-frame"/);
  assert.match(source, /className="fan-scan-corner is-top-left"/);
  assert.match(source, /className="fan-scan-detecting"/);
  assert.match(source, /className="fan-scan-manual-link"/);
  assert.doesNotMatch(source, /#FFD700|rgba\(255,215,0/);
  assert.match(css, /\.fan-scan-camera-viewport/);
  assert.match(css, /\.fan-scan-frame[\s\S]*border:\s*2px solid rgba\(204, 255, 0, 0\.72\)/);
  assert.match(css, /\.fan-scan-corner[\s\S]*border-color:\s*#ccff00/);
  assert.match(css, /\.fan-scan-manual-link\.ant-btn-link[\s\S]*color:\s*#2d4100/);
  assert.match(css, /\.fan-scan-submit\.ant-btn-primary[\s\S]*background:\s*var\(--fan-brand-gradient\)/);
  assert.match(css, /\.fan-scan-modal-root \.ant-modal-content,[\s\S]*\.fan-scan-modal \.ant-modal-container[\s\S]*border:\s*1px solid var\(--fan-brand-border\)/);
});

test('scan tab Task-093 becomes a lighter secondary page with folded rules', () => {
  const css = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');
  assert.match(source, /fan-scan-focus-hero/);
  assert.match(source, /fan-scan-visual-stage/);
  assert.match(source, /fan-scan-qr-mark/);
  assert.match(source, /fan-scan-status-strip/);
  assert.match(source, /fan-scan-guide-link/);
  assert.match(source, /<details className="fan-scan-rules-drawer[^"]*">/);
  assert.match(source, /<summary>\{t\('fan_real_scan_rules_summary'/);
  assert.match(source, /fan-scan-code-matrix is-folded/);
  assert.match(source, /fan-scan-warning-note/);
  assert.doesNotMatch(source, /<section className="fan-scan-cockpit">/);
  assert.doesNotMatch(source, /<section className="fan-scan-remaining-card">/);

  assert.match(css, /\.fan-shell \.fan-scan-page[\s\S]*max-width:\s*960px/);
  assert.match(css, /\.fan-shell \.fan-scan-focus-hero/);
  assert.match(css, /\.fan-shell \.fan-scan-visual-stage/);
  assert.match(css, /\.fan-shell \.fan-scan-qr-mark/);
  assert.match(css, /\.fan-shell \.fan-scan-status-strip/);
  assert.match(css, /\.fan-shell \.fan-scan-rules-drawer/);
  assert.match(css, /\.fan-shell \.fan-scan-code-matrix\.is-folded/);
  assert.match(css, /\.fan-shell \.fan-scan-warning-note/);
});

test('scan tab Task-097 centers the scan hero stage in the secondary page', () => {
  const css = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');
  assert.match(css, /\.fan-shell \.fan-scan-page[\s\S]*max-width:\s*960px[\s\S]*margin-inline:\s*auto/);
  assert.match(css, /\.fan-shell \.fan-scan-focus-hero[\s\S]*grid-template-columns:\s*minmax\(280px, 0\.92fr\) minmax\(280px, 0\.92fr\)/);
  assert.match(css, /\.fan-shell \.fan-scan-focus-hero[\s\S]*justify-content:\s*center/);
  assert.match(css, /\.fan-shell \.fan-scan-visual-stage[\s\S]*justify-self:\s*center/);
  assert.match(css, /\.fan-shell \.fan-scan-copy-stage[\s\S]*justify-self:\s*center/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.fan-shell \.fan-scan-copy-stage[\s\S]*text-align:\s*center/);
});

test('scan tab Task-098 presents scan as a focused action page with folded details', () => {
  const css = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');
  assert.match(source, /fan-scan-page fan-scan-primary-task-page/);
  assert.match(source, /fan-scan-main-action-panel/);
  assert.match(source, /fan-scan-rules-drawer is-secondary-detail/);
  assert.match(source, /fan-scan-recent-panel is-secondary-history/);
  assert.match(translationsSource, /fan_real_scan_desc: 'Unique product codes add points. Other UWELL codes confirm activity.'/);

  assert.match(css, /\/\* Task-098 Fan Scan focused secondary page rhythm\. \*\//);
  assert.match(css, /\.fan-shell \.fan-scan-main-action-panel/);
  assert.match(css, /\.fan-shell \.fan-scan-rules-drawer\.is-secondary-detail/);
  assert.match(css, /\.fan-shell \.fan-scan-recent-panel\.is-secondary-history/);
});

test('scan tab Task-099 keeps the primary action centered and removes Chinese residual separators', () => {
  const css = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');
  assert.match(source, /fan-scan-centered-action-lock/);
  assert.match(source, /fan-scan-main-action-panel/);
  assert.match(source, /\{status\} · \{scanTime \? new Date\(scanTime\)\.toLocaleString\('en-US'\) : '-'\}/);
  assert.doesNotMatch(source, /路/);
  assert.match(css, /\/\* Task-099 Fan Scan action alignment lock\. \*\//);
  assert.match(css, /\.fan-shell \.fan-scan-centered-action-lock/);
  assert.match(css, /\.fan-shell \.fan-scan-centered-action-lock \.fan-scan-focus-hero[\s\S]*max-width:\s*920px/);
  assert.match(css, /\.fan-shell \.fan-scan-centered-action-lock \.fan-scan-action-grid[\s\S]*justify-items:\s*stretch/);
  assert.match(css, /\.fan-shell \.fan-scan-centered-action-lock \.fan-scan-limit-note[\s\S]*text-align:\s*center/);
});

test('scan tab Task-100 uses one aligned secondary page grid and full-width scan details', () => {
  const css = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');
  assert.match(source, /fan-scan-layout-discipline/);
  assert.doesNotMatch(source, /路/);
  assert.match(source, /\{status\} · \{scanTime \? new Date\(scanTime\)\.toLocaleString\('en-US'\) : '-'\}/);

  assert.match(css, /\/\* Task-100 Fan Scan secondary alignment discipline\. \*\//);
  assert.match(css, /\.fan-shell \.fan-scan-layout-discipline/);
  assert.match(css, /\.fan-shell \.fan-scan-layout-discipline \.fan-scan-focus-hero[\s\S]*grid-template-columns:\s*minmax\(340px, 1fr\) minmax\(340px, 1fr\)/);
  assert.match(css, /\.fan-shell \.fan-scan-layout-discipline \.fan-scan-focus-hero[\s\S]*margin-bottom:\s*124px/);
  assert.match(css, /\.fan-shell \.fan-scan-layout-discipline \.fan-scan-visual-stage[\s\S]*width:\s*100%/);
  assert.match(css, /\.fan-shell \.fan-scan-layout-discipline \.fan-scan-main-action-panel[\s\S]*width:\s*100%/);
  assert.match(css, /\.fan-shell \.fan-scan-layout-discipline \.fan-scan-status-strip[\s\S]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.fan-shell \.fan-scan-layout-discipline \.fan-scan-rules-drawer,[\s\S]*\.fan-shell \.fan-scan-layout-discipline \.fan-scan-recent-panel[\s\S]*width:\s*100%/);
  assert.match(css, /\.fan-shell \.fan-scan-layout-discipline \.fan-scan-rules-drawer[\s\S]*justify-self:\s*stretch/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.fan-shell \.fan-scan-layout-discipline \.fan-scan-status-strip[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.fan-shell \.fan-scan-layout-discipline \.fan-scan-focus-hero[\s\S]*margin-bottom:\s*32px/);
});
