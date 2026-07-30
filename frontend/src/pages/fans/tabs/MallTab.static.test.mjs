import { existsSync, readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./MallTab.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');
const translationsSource = readFileSync(new URL('../../../utils/translations.js', import.meta.url), 'utf8');
const constantsSource = readFileSync(new URL('../../../utils/constants.js', import.meta.url), 'utf8');
const publicRoot = new URL('../../../../public/', import.meta.url);

test('redemption success modal uses an isolated readable style scope', () => {
  assert.match(source, /createPendingRedemption/);
  assert.match(source, /createRewardRedemptionRemote/);
  assert.match(source, /pending_pickup/);
  assert.match(source, /t\('fan_real_reward_pickup_note'\)/);
  assert.match(source, /Normal rewards: A\/S stores/);
  assert.match(source, /Premium rewards: S stores/);
  assert.match(source, /Diamond luxury rewards require backend approval/);
  assert.match(source, /rewardRules/);
  assert.match(source, /t\('fan_real_view_rules'\)/);
  assert.match(translationsSource, /fan_real_view_rules: 'View full redemption rules'/);
  assert.match(source, /t\('fan_real_reward_one_time'\)/);
  assert.match(source, /t\('fan_real_reward_understand'\)/);
  assert.match(source, /className="fan-redemption-modal"/);
  assert.match(source, /className="fan-redemption-status"/);
  assert.match(source, /className="fan-redemption-code"/);
  assert.match(source, /className="fan-redemption-code-value"/);
  assert.match(source, /width=\{420\}/);
  assert.match(css, /\.fan-redemption-modal \.ant-modal-content/);
  assert.match(css, /\.fan-redemption-modal-root \.ant-modal-container/);
  assert.match(css, /\.fan-redemption-status/);
  assert.match(css, /\.fan-redemption-code-value/);
  assert.match(css, /word-break:\s*break-word/);
});

test('redemption success also renders an inline code fallback for pickup closure', () => {
  assert.match(source, /fan-redemption-inline/);
  assert.match(source, /redeemResult && \(/);
  assert.match(source, /t\('fan_real_reward_pickup_note'\)/);
  assert.match(source, /fan-redemption-code-value/);
  assert.match(css, /\.fan-redemption-inline/);
});

test('redemption code is persisted through fan point refresh rerenders', () => {
  assert.match(source, /getStoredRedeemResult/);
  assert.match(source, /storeRedeemResult/);
  assert.match(source, /clearStoredRedeemResult/);
  assert.match(source, /sessionStorage\.setItem/);
  assert.match(source, /sessionStorage\.getItem/);
  assert.match(source, /sessionStorage\.removeItem/);
  assert.match(source, /uwell_latest_redemption_/);
  assert.match(source, /setRedeemResult\(result\)/);
});

test('closing redemption modal clears the restored result so the UI does not get stuck', () => {
  assert.match(source, /handleCloseRedeemResult/);
  assert.match(source, /clearStoredRedeemResult\(fan\?\.id\)/);
  assert.match(source, /onCancel=\{handleCloseRedeemResult\}/);
});

test('reward redemption falls back to a local pickup code if remote redemption fails', () => {
  assert.match(source, /createLocalRedemption/);
  assert.match(source, /remote redemption unavailable/i);
  assert.match(source, /localDb\.insert\('mall_redemptions', pendingRedemption\)/);
  assert.match(source, /t\('fan_real_reward_saved_local'\)/);
  assert.match(translationsSource, /Redemption saved locally/);
});

test('rewards page uses a point mall grid instead of dense rule cards', () => {
  assert.match(source, /fan-reward-mall-shell/);
  assert.match(source, /fan-reward-hero/);
  assert.match(source, /fan-reward-filter-bar/);
  assert.match(source, /visibleCategories/);
  assert.match(source, /fan-reward-category-count/);
  assert.match(source, /fan-reward-section-head/);
  assert.match(source, /t\('fan_real_browse_rewards'\)/);
  assert.match(translationsSource, /fan_real_browse_rewards: 'Browse rewards'/);
  assert.match(source, /fan-reward-product-grid/);
  assert.match(source, /fan-reward-product-card/);
  assert.match(source, /fan-reward-image-slot/);
  assert.match(source, /t\('fan_real_reward_image'\)/);
  assert.match(source, /fan-reward-status-row/);
  assert.match(source, /fan-reward-rules-toggle/);
  assert.match(source, /t\('fan_real_rewards_label'\)/);
  assert.match(translationsSource, /fan_real_rewards_label: 'Points Mall'/);
  assert.match(source, /t\('fan_real_reward_available'\)/);
  assert.match(source, /t\('fan_real_reward_almost_there'\)/);
  assert.match(source, /t\('fan_real_reward_review_required'\)/);
  assert.match(source, /fan-reward-flow-strip/);
  assert.match(source, /t\('fan_real_reward_choose'\)/);
  assert.match(source, /t\('fan_real_reward_redeem_step'\)/);
  assert.match(source, /t\('fan_real_reward_pick_up'\)/);
  assert.match(css, /\.fan-reward-product-grid/);
  assert.match(css, /\.fan-reward-product-card/);
  assert.match(css, /\.fan-reward-image-slot/);
  assert.match(css, /\.fan-reward-category-count/);
  assert.match(css, /\.fan-reward-flow-strip/);
});

test('rewards categories use the current non-empty catalog and include a translated VIP label', () => {
  assert.match(source, /const visibleCategories = categories\.filter/);
  assert.match(source, /getCategoryCount\(cat\) > 0/);
  assert.match(source, /fan_real_reward_category_vip/);
  assert.match(translationsSource, /fan_real_reward_category_vip: 'VIP'/);
});

test('rewards page uses unified yellow green mall styling without default tag colors', () => {
  assert.match(source, /fan-reward-theme-hero/);
  assert.match(source, /fan-reward-chip/);
  assert.match(source, /fan-reward-status-chip/);
  assert.match(source, /fan-reward-category-chip/);
  assert.match(source, /fan-reward-redeem-button/);
  assert.match(source, /fan-reward-secondary-button/);
  assert.match(source, /fan-reward-confirm-button/);
  assert.doesNotMatch(source, /<Tag className=\{`fan-reward-status/);
  assert.doesNotMatch(source, /<Tag className="fan-reward-category"/);
  assert.match(css, /\.fan-reward-theme-hero/);
  assert.match(css, /\.fan-reward-status-chip/);
  assert.match(css, /\.fan-reward-redeem-button/);
  assert.match(css, /--fan-brand-gradient/);
});

test('rewards page keeps pickup rules compact while preserving the business meaning', () => {
  assert.match(source, /fan-reward-policy-list/);
  assert.match(source, /t\('fan_real_reward_policy_points'\)/);
  assert.match(source, /t\('fan_real_reward_policy_as'\)/);
  assert.match(source, /t\('fan_real_reward_policy_s'\)/);
  assert.match(source, /t\('fan_real_reward_policy_diamond'\)/);
  assert.match(translationsSource, /Available points are spent; lifetime growth stays/);
  assert.doesNotMatch(source, /Available points are deducted; lifetime growth points are never deducted\./);
  assert.match(css, /\.fan-reward-policy-list/);
});

test('reward actions meet mobile touch target guidance', () => {
  assert.match(css, /\.fan-shell \.fan-reward-actions \.ant-btn[\s\S]*min-height:\s*44px/);
  assert.match(css, /\.fan-shell \.fan-reward-rules-toggle[\s\S]*min-height:\s*44px/);
  assert.match(css, /\.fan-shell \.fan-reward-redeem-button[\s\S]*min-height:\s*44px/);
});

test('reward category filters fit narrow mobile viewports without hidden chip overflow', () => {
  assert.match(css, /\.fan-reward-filter-bar[\s\S]*flex-wrap:\s*wrap/);
  assert.match(css, /\.fan-reward-filter-bar[\s\S]*overflow-x:\s*visible/);
  assert.match(css, /\.fan-reward-filter-bar button[\s\S]*max-width:\s*calc\(50% - 4px\)/);
  assert.match(css, /\.fan-reward-filter-bar button[\s\S]*min-width:\s*0/);
  assert.match(css, /\.fan-reward-filter-bar button > span[\s\S]*min-width:\s*0/);
  assert.match(css, /\.fan-reward-category-count[\s\S]*flex:\s*0 0 auto/);
});

test('task 102 reward catalog binds every mall item to a unique concrete visual asset', () => {
  const imageMatches = [...constantsSource.matchAll(/image:\s*'([^']+)'/g)].map((match) => match[1]);
  const task102RewardImages = imageMatches.filter((imagePath) => imagePath.startsWith('/uwell-assets/rewards/task102-'));

  assert.equal(task102RewardImages.length, 8);
  assert.equal(new Set(task102RewardImages).size, 8);
  assert.doesNotMatch(constantsSource, /image:\s*''/);

  for (const imagePath of task102RewardImages) {
    const assetPath = new URL(imagePath.replace(/^\//, ''), publicRoot);
    assert.equal(existsSync(assetPath), true, `${imagePath} should exist in public assets`);
  }
});

test('task 102 rewards page uses one page-level rules action instead of repeating rules inside every reward card', () => {
  assert.match(source, /fan-reward-page-rules-action/);
  assert.match(source, /fan-reward-hero-visual/);
  assert.match(source, /fan-reward-card-meta/);
  assert.doesNotMatch(source, /className="fan-reward-secondary-button" size="small" onClick=\{\(\) => setRulesOpen\(true\)\}/);
  assert.match(css, /\.fan-reward-hero-visual/);
  assert.match(css, /\.fan-reward-image-slot\.is-product/);
  assert.match(css, /\.fan-reward-image-slot\.is-lifestyle/);
  assert.match(css, /\.fan-reward-card-meta/);
});

test('rewards Task-108 moves the catalog above dense rules so mobile sees products first', () => {
  assert.match(source, /fan-reward-mall-shell fan-reward-first-screen-lock/);
  assert.match(source, /fan-reward-utility-row/);
  assert.match(source, /fan-reward-compact-rule-link/);
  assert.match(source, /fan-reward-catalog-priority/);
  assert.match(source, /fan-reward-theme-hero[\s\S]*fan-reward-flow-strip[\s\S]*fan-reward-catalog-priority[\s\S]*fan-reward-policy-list/);
  assert.doesNotMatch(source, /fan-reward-summary-strip[\s\S]{0,900}fan-reward-catalog-priority/);

  assert.match(css, /\/\* Task-108 Fan Home and Rewards first-screen reduction\. \*\//);
  assert.match(css, /\.fan-reward-first-screen-lock \.fan-reward-theme-hero/);
  assert.match(css, /\.fan-reward-utility-row/);
  assert.match(css, /\.fan-reward-catalog-priority/);
  assert.match(css, /\.fan-reward-first-screen-lock \.fan-reward-summary-strip/);
  assert.match(css, /@media \(min-width: 900px\)[\s\S]*\.fan-reward-first-screen-lock \.fan-reward-lock-reason[\s\S]*display:\s*none/);
  assert.match(css, /@media \(min-width: 900px\)[\s\S]*\.fan-reward-first-screen-lock \.fan-reward-product-grid[\s\S]*row-gap:\s*112px/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.fan-reward-first-screen-lock \.fan-reward-theme-hero[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\) 116px/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.fan-reward-first-screen-lock \.fan-reward-hero-visual[\s\S]*min-height:\s*132px/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.fan-reward-first-screen-lock \.fan-reward-product-grid[\s\S]*grid-auto-flow:\s*column/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.fan-reward-first-screen-lock \.fan-reward-product-grid[\s\S]*overflow-x:\s*auto/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.fan-reward-first-screen-lock \.fan-reward-image-slot[\s\S]*min-height:\s*78px/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.fan-reward-first-screen-lock \.fan-reward-policy-list[\s\S]*display:\s*none/);
});

test('rewards Task-109 keeps redemption steps immediately visible near the top navigation', () => {
  assert.match(source, /fan-reward-theme-hero[\s\S]{0,1800}fan-reward-flow-strip[\s\S]{0,1200}fan-reward-catalog-priority/);
  assert.doesNotMatch(source, /fan-reward-catalog-priority[\s\S]{0,5000}fan-reward-flow-strip/);
  assert.match(css, /\/\* Task-109 Fan browser comment correction pass\. \*\//);
  assert.match(css, /\.fan-reward-first-screen-lock \.fan-reward-flow-strip[\s\S]*margin:\s*6px 0 10px/);
  assert.match(css, /\.fan-reward-first-screen-lock \.fan-reward-flow-strip[\s\S]*position:\s*relative/);
});

test('rewards Task-135B restores readable mobile reward card hierarchy', () => {
  assert.match(css, /Task-135B: Fan Rewards readability and card rhythm pass/);
  assert.match(css, /\.fan-shell \.fan-reward-image-slot,[\s\S]*\.fan-center-liquid-shell \.fan-reward-image-slot\s*\{[^}]*aspect-ratio:\s*4 \/ 3 !important;[^}]*min-height:\s*126px !important;[^}]*max-height:\s*none !important/s);
  assert.match(css, /\.fan-shell \.fan-reward-product-card h3,[\s\S]*\.fan-center-liquid-shell \.fan-reward-product-card h3\s*\{[^}]*font-size:\s*14px !important/s);
  assert.match(css, /\.fan-shell \.fan-reward-card-meta,[\s\S]*\.fan-center-liquid-shell \.fan-reward-card-meta\s*\{[^}]*display:\s*grid !important/s);
  assert.match(css, /\.fan-shell \.fan-reward-pickup-row,[\s\S]*\.fan-center-liquid-shell \.fan-reward-pickup-row\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(css, /\.fan-reward-first-screen-lock \.fan-reward-image-slot\s*\{[^}]*max-height:\s*none !important/s);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.fan-reward-first-screen-lock \.fan-reward-card-meta\s*\{[^}]*display:\s*grid !important/s);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.fan-reward-first-screen-lock \.fan-reward-actions \.ant-btn,[\s\S]*\.fan-reward-first-screen-lock \.fan-reward-redeem-button\s*\{[^}]*min-height:\s*44px !important/s);
});

test('rewards keep the final mobile product cards clear of the fixed bottom navigation', () => {
  assert.match(source, /fan-reward-bottom-clearance/);
  assert.match(css, /Task-148: targeted trial polish fixes/);
  assert.match(css, /\.fan-shell \.fan-reward-bottom-clearance,[\s\S]*\.fan-center-liquid-shell \.fan-reward-bottom-clearance\s*\{[^}]*min-height:\s*max\(132px,\s*calc\(104px \+ env\(safe-area-inset-bottom\)\)\) !important/s);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.fan-shell \.fan-reward-bottom-clearance,[\s\S]*\.fan-center-liquid-shell \.fan-reward-bottom-clearance\s*\{[^}]*min-height:\s*max\(176px,\s*calc\(148px \+ env\(safe-area-inset-bottom\)\)\) !important/s);
});
