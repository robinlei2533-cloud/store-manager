import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./StoreOwnerPage.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

test('store app exposes S Report only for active S Stores', () => {
  assert.match(source, /const isActiveSStoreAccount = Boolean\(store\?\.is_s_store \|\| store\?\.level === "S"\) && \(store\?\.s_store_status \|\| "active"\) === "active"/);
  assert.match(source, /isActiveSStoreAccount && \{\s*key: "s-report"/);
  assert.match(source, /isActiveSStoreAccount && \{\s*key: "s-report", label: t\("store_owner_tab_s_report"\)/);
  assert.match(source, /isActiveSStoreAccount && \{\s*key: "s-report", label: <span><InboxOutlined \/> \{t\("store_owner_tab_s_report"\)\}<\/span>/);
  assert.doesNotMatch(source, /key: "s-report", label: <span><ShopOutlined/);
});

test('S Report submits sell-through product inventory and material inventory through S Store services', () => {
  assert.match(source, /submitSStoreSellThrough/);
  assert.match(source, /submitSStoreInventory/);
  assert.match(source, /submitSStoreMaterialInventory/);
  assert.match(source, /getSStoreSellThroughHistory/);
  assert.match(source, /getSStoreInventoryHistory/);
  assert.match(source, /getSStoreMaterialInventoryHistory/);
  assert.match(source, /handleSubmitSStoreSellThrough/);
  assert.match(source, /handleSubmitSStoreProductInventory/);
  assert.match(source, /handleSubmitSStoreMaterialInventory/);
});

test('S Report uses the confirmed V1 fields and locked history copy', () => {
  assert.match(source, /Weekly/);
  assert.match(source, /Monthly/);
  assert.match(source, /Open-system sold quantity/);
  assert.match(source, /Disposable sold quantity/);
  assert.match(source, /Open-system current stock/);
  assert.match(source, /Open-system target stock/);
  assert.match(source, /Disposable current stock/);
  assert.match(source, /Disposable target stock/);
  assert.match(source, /Material type/);
  assert.match(source, /Current quantity/);
  assert.match(source, /Target quantity/);
  assert.doesNotMatch(source, /t\("store_owner_s_report_desc"\)/);
});

test('S Report is styled as a store operating workbench', () => {
  assert.match(source, /store-s-report-workbench/);
  assert.match(source, /store-s-report-form-grid/);
  assert.match(source, /store-s-report-history/);
  assert.match(css, /store-s-report-workbench/);
  assert.match(css, /store-s-report-form-grid/);
  assert.match(css, /store-s-report-history/);
});

test('S Report explains the daily S Store execution rhythm without adding new rules', () => {
  assert.match(source, /sStoreReportExecutionItems/);
  assert.match(source, /store-s-report-hero-actions/);
  assert.match(source, /store-s-report-hero-actions[\s\S]*store-execution-command-grid/);
  assert.match(source, /store_owner_weekly_sell_through/);
  assert.match(source, /store_owner_monthly_sell_through/);
  assert.match(source, /store_owner_product_stock_check/);
  assert.match(source, /store_owner_material_stock_check/);
  assert.doesNotMatch(source, /store_owner_weekly_sell_through_desc/);
  assert.doesNotMatch(source, /store_owner_monthly_sell_through_desc/);
  assert.doesNotMatch(source, /store_owner_product_stock_check_desc/);
  assert.doesNotMatch(source, /store_owner_material_stock_check_desc/);
  assert.doesNotMatch(source, /<p>\{t\(desc\)\}<\/p>/);
  assert.doesNotMatch(source, /store-s-report-execution-lane/);
  assert.doesNotMatch(source, /t\("store_owner_s_execution_desc"\)/);
  assert.match(css, /store-s-report-hero-actions/);
  assert.match(css, /store-s-report-hero-actions \.store-execution-command-grid/);
  assert.doesNotMatch(css, /store-s-report-execution-lane/);
});

test('S Report removes form and history explanation strips while preserving operations', () => {
  [
    'store-s-report-form-panel',
    'store-s-report-history-card',
    'Submitted and locked',
    'handleSubmitSStoreSellThrough',
    'handleSubmitSStoreProductInventory',
    'handleSubmitSStoreMaterialInventory',
    'refreshSStoreReportHistory',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should improve S Report readability`));
  [
    'store-s-report-form-meta',
    'store-s-report-history-meta',
    'store_owner_sell_through_rhythm',
    'store_owner_sell_through_rhythm_desc',
    'store_owner_stock_health',
    'store_owner_stock_health_desc',
    'store_owner_material_readiness',
    'store_owner_material_readiness_desc',
    'Latest locked history snapshot',
    'Low-stock signal stays visible',
    'Material readiness for field follow-up',
  ].forEach((label) => assert.ok(!source.includes(label), `${label} should not remain as S Report small explanatory copy`));
  assert.match(css, /store-s-report-form-panel/);
  assert.match(css, /store-s-report-history-card/);
  assert.doesNotMatch(css, /store-s-report-form-meta/);
  assert.doesNotMatch(css, /store-s-report-history-meta/);
});

test('store owner date fields avoid browser-localized native placeholders', () => {
  assert.match(source, /DatePicker/);
  assert.doesNotMatch(source, /<Input type="date"/);
  assert.match(source, /format="YYYY-MM-DD"/);
  assert.match(source, /placeholder="YYYY-MM-DD"/);
  assert.match(source, /formatStoreDateValue\(values\.period_start\)/);
  assert.match(source, /formatStoreDateValue\(values\.period_end\)/);
  assert.match(source, /formatStoreDateValue\(values\.start_date\)/);
  assert.match(source, /formatStoreDateValue\(values\.end_date\)/);
});

test('S Report form controls use readable light inputs on the store portal', () => {
  assert.match(css, /\.store-s-report-workbench \.ant-picker,/);
  assert.match(css, /\.store-s-report-workbench \.ant-select:not\(\.ant-select-customize-input\),/);
  assert.match(css, /\.store-s-report-workbench \.ant-select-content,/);
  assert.match(css, /\.store-s-report-workbench \.ant-select:not\(\.ant-select-customize-input\) \.ant-select-selector,/);
  assert.match(css, /\.store-s-report-workbench \.ant-input-number,/);
  assert.match(css, /\.store-s-report-workbench textarea\.ant-input,/);
  assert.match(css, /\.store-s-report-workbench \.so-input-dark\s*\{[^}]*background:\s*#ffffff !important/s);
  assert.match(css, /\.store-s-report-workbench \.ant-input-number-input,/);
  assert.match(css, /\.store-s-report-workbench \.ant-picker-input > input,/);
  assert.match(css, /\.store-s-report-workbench \.ant-select-content,/);
  assert.match(css, /\.store-s-report-workbench \.ant-select-input,/);
  assert.match(css, /\.store-s-report-workbench \.ant-select-selection-item,/);
  assert.match(css, /\.store-s-report-workbench \.ant-select-selection-placeholder\s*\{[^}]*color:\s*#1f1a12 !important/s);
  assert.match(css, /\.store-s-report-workbench \.ant-input::placeholder,/);
  assert.match(css, /\.store-s-report-workbench \.ant-picker-input > input::placeholder\s*\{[^}]*color:\s*rgba\(31,\s*26,\s*18,\s*0\.58\) !important/s);
  assert.match(css, /\.store-s-report-workbench \.ant-picker-suffix,/);
  assert.match(css, /\.store-s-report-workbench \.ant-select-suffix,/);
  assert.match(css, /\.store-s-report-workbench \.ant-select-arrow\s*\{[^}]*color:\s*#1f1a12 !important/s);
  assert.match(css, /\.store-s-report-workbench \.ant-input-number-handler-wrap\s*\{[^}]*opacity:\s*1 !important/s);
});

test('S Report calendar dropdown keeps readable contrast on light surfaces', () => {
  const sReportFormSection = source.match(/<div className="store-s-report-form-grid"[\s\S]*?<div className="store-s-report-history[^"]*">/)?.[0] || '';
  assert.doesNotMatch(sReportFormSection, /popupClassName="store-s-report-calendar-dropdown"/);
  assert.match(sReportFormSection, /classNames=\{\{ popup: \{ root: "store-s-report-calendar-dropdown" \} \}\}/);
  assert.match(css, /\.store-s-report-calendar-dropdown \.ant-picker-panel-container/);
  assert.match(css, /\.store-s-report-calendar-dropdown \.ant-picker-header/);
  assert.match(css, /\.store-s-report-calendar-dropdown \.ant-picker-cell-inner/);
  assert.match(css, /\.store-s-report-calendar-dropdown \.ant-picker-cell-selected \.ant-picker-cell-inner/);
});

test('S Report mobile entry uses compact numeric controls and short note fields', () => {
  const sReportFormSection = source.match(/<div className="store-s-report-form-grid"[\s\S]*?<div className="store-s-report-history[^"]*">/)?.[0] || '';
  assert.match(source, /const sReportNumberInputProps = \{/);
  assert.match(source, /inputMode: "numeric"/);
  assert.match(source, /controls: false/);
  assert.match(sReportFormSection, /className="store-s-report-pair-row"/);
  assert.match(sReportFormSection, /<Input\.TextArea rows=\{1\} className="so-input-dark" \/>/);
  assert.doesNotMatch(sReportFormSection, /<Input\.TextArea rows=\{2\} className="so-input-dark" \/>/);
  assert.match(css, /\.store-s-report-pair-row/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.store-s-report-pair-row\s*\{[^}]*row-gap:\s*6px/s);
});

test('Task 140 S Report becomes a segmented workbench without changing report submissions', () => {
  const sReportSection = source.match(/const SStoreReportTab = \(\) => \([\s\S]*?const RewardPickupTab = \(\) => \(/)?.[0] || '';
  assert.match(sReportSection, /store-s-report-mode-bar/);
  assert.match(sReportSection, /store-s-report-mode-card/);
  assert.match(sReportSection, /data-step="01"/);
  assert.match(sReportSection, /data-step="02"/);
  assert.match(sReportSection, /data-step="03"/);
  assert.match(sReportSection, /store-s-report-history-lockup/);
  [
    'handleSubmitSStoreSellThrough',
    'handleSubmitSStoreProductInventory',
    'handleSubmitSStoreMaterialInventory',
    'classNames={{ popup: { root: "store-s-report-calendar-dropdown" } }}',
  ].forEach((label) => assert.ok(sReportSection.includes(label), `${label} should remain in S Report`));
  assert.match(source, /refreshSStoreReportHistory/);
  assert.match(css, /Task-140: Authorized full follow-up UI finish pass/);
  assert.match(css, /\.store-liquid-shell \.store-s-report-mode-card\s*\{[^}]*min-height:\s*68px !important/s);
});
