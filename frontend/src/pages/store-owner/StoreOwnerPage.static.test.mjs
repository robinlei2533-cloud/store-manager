import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const entrySource = readFileSync(new URL('./StoreEntryPage.jsx', import.meta.url), 'utf8');
const ownerSource = readFileSync(new URL('./StoreOwnerPage.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

test('store entry keeps English copy without overriding saved Arabic language choice', () => {
  assert.doesNotMatch(entrySource, /ensureEnglishFirst\(\)/);
  assert.doesNotMatch(entrySource, /setLang\("en"\)/);
  assert.doesNotMatch(ownerSource, /setLang\("en"\)/);
  assert.match(entrySource, /t\("store_entry_store_name_placeholder"\)/);
  assert.match(entrySource, /t\("store_entry_submit_review"\)/);
});

test('store owner local trial recovers invalid saved store id without remote 400 lookup', () => {
  assert.match(ownerSource, /const isLocalTrialHost = \(\) =>/);
  assert.match(ownerSource, /127\.0\.0\.1/);
  assert.match(ownerSource, /shouldAllowLocalDbFallback/);
  assert.match(ownerSource, /const canUseRemoteStoreLookup = savedStoreId && !activeStore && !isLocal\(\) && !shouldAllowLocalDbFallback\(\) && !isLocalTrialHost\(\)/);
  assert.match(ownerSource, /if \(canUseRemoteStoreLookup\)/);
  assert.match(ownerSource, /localStorage\.setItem\("store_owner_store_id", activeStore\.id\)/);
  assert.doesNotMatch(ownerSource, /if \(savedStoreId && !activeStore\) \{\s*try \{\s*activeStore = await getStoreById\(savedStoreId\)/);
});

test('store owner app uses the confirmed four operating tabs', () => {
  assert.match(ownerSource, /key: "home", label: <span><ShopOutlined \/> \{t\("store_owner_tab_home"\)\}<\/span>/);
  assert.match(ownerSource, /key: "verify", label: <span><GiftOutlined \/> \{t\("store_owner_tab_verify"\)\}<\/span>/);
  assert.match(ownerSource, /key: "activities", label: <span><FireOutlined \/> \{t\("store_owner_tab_activities"\)\}<\/span>/);
  assert.match(ownerSource, /key: "me", label: <span><UserOutlined \/> \{t\("store_owner_tab_me"\)\}<\/span>/);
  assert.doesNotMatch(ownerSource, /label: <span><PictureOutlined \/> Display<\/span>/);
  assert.doesNotMatch(ownerSource, /label: <span><GiftOutlined \/> Materials<\/span>/);
  assert.match(ownerSource, /bottomNavItems/);
  assert.match(ownerSource, /store-bottom-nav/);
  assert.match(ownerSource, /aria-label="Store owner navigation"/);
});

test('store app explains verification-only points and store-created campaign cost responsibility', () => {
  assert.match(ownerSource, /Verify actions/);
  assert.match(ownerSource, /Scan fan identity QR to verify participation/);
  assert.match(ownerSource, /Enter Fan ID or email when QR is unavailable/);
  assert.match(ownerSource, /Check redemption code before handing over reward/);
  assert.match(ownerSource, /Official campaigns/);
  assert.match(ownerSource, /Store-created events/);
  assert.match(ownerSource, /Materials, gifts, or costs may need to be handled by the store/);
  assert.match(ownerSource, /OPERATIONAL_RULE_RECORD_ID/);
  assert.match(ownerSource, /mergeOperationalRules/);
  assert.match(ownerSource, /operationalRules\.storeEventMinPoints/);
  assert.match(ownerSource, /operationalRules\.storeEventMaxPoints/);
  assert.match(ownerSource, /operational_rule_snapshot/);
});

test('store app shows review feedback for events materials and photos', () => {
  assert.match(ownerSource, /t\("store_owner_store_operations_status"\)/);
  assert.match(ownerSource, /Track UWELL review feedback/);
  assert.match(ownerSource, /operationStatusItems/);
  assert.match(ownerSource, /My store events/);
  assert.match(ownerSource, /UWELL campaigns/);
  assert.match(ownerSource, /My material requests/);
  assert.match(ownerSource, /reviewStatusLabel/);
  assert.match(ownerSource, /reviewStatusColor/);
  assert.match(ownerSource, /Please upload a clearer photo for UWELL review/);
  assert.match(css, /store-feedback-row/);
});

test('store home uses an actionable today operating queue', () => {
  assert.match(ownerSource, /todayOperatingQueue/);
  assert.match(ownerSource, /todayQueueProgress/);
  assert.match(ownerSource, /Today operating queue/);
  assert.match(ownerSource, /Complete store photos/);
  assert.match(ownerSource, /Verify fan visits/);
  assert.match(ownerSource, /Submit campaign results/);
  assert.match(ownerSource, /Request low materials/);
  assert.match(ownerSource, /operationalRules\.materialLowStockThreshold/);
  assert.match(ownerSource, /effectiveSafetyStock/);
  assert.match(ownerSource, /All core tasks are clear/);
  assert.match(css, /store-today-queue/);
  assert.match(css, /store-queue-task/);
  assert.match(css, /store-queue-progress/);
});

test('store home renders today operating queue as compact actions without task descriptions', () => {
  assert.match(ownerSource, /store-queue-compact-progress/);
  assert.match(ownerSource, /store-queue-compact-task/);
  assert.match(ownerSource, /onClick=\{\(\) => setActiveTab\(task\.tab\)\}/);
  assert.doesNotMatch(ownerSource, /<p>\{task\.desc\}<\/p>/);
  assert.doesNotMatch(ownerSource, /<p>\{st\("Keep photos, verification, campaign results, and material stock clear for fan-facing exposure\."\)\}<\/p>/);
  assert.match(css, /\.store-queue-compact-task\s*\{[^}]*grid-template-columns:\s*auto minmax\(0,\s*1fr\) auto/s);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.store-queue-compact-task\s*\{[^}]*min-height:\s*58px/s);
});

test('store app exposes a compact daily command center across store work areas', () => {
  assert.match(ownerSource, /storeHomeCommandItems/);
  assert.match(ownerSource, /store-home-command-center/);
  assert.match(ownerSource, /t\("store_owner_today_execution_command"\)/);
  assert.match(ownerSource, /Setup readiness/);
  assert.match(ownerSource, /Fan verification/);
  assert.match(ownerSource, /Campaign execution/);
  assert.match(ownerSource, /Materials/);
  assert.doesNotMatch(ownerSource, /title: t\("store_owner_tab_s_report"\),[\s\S]{0,220}tab: "s-report"/);
  assert.doesNotMatch(ownerSource, /title: t\("store_owner_reward_pickup"\),[\s\S]{0,220}tab: "verify"/);
  assert.match(ownerSource, /storeHomePrimaryAction/);
  assert.match(css, /store-home-command-center/);
  assert.match(css, /store-home-command-grid/);
});

test('store home first screen separates store value from today action without long explanations', () => {
  assert.match(ownerSource, /storeHomeValueItems/);
  assert.match(ownerSource, /store-home-value-strip/);
  assert.match(ownerSource, /Fan traffic/);
  assert.match(ownerSource, /Free campaign materials/);
  assert.match(ownerSource, /Official authorized store/);
  assert.match(ownerSource, /More exposure/);
  assert.match(ownerSource, /store-home-value-grid/);
  assert.match(ownerSource, /store-home-benefit-chip/);
  assert.doesNotMatch(ownerSource, /<Text className="so-text-white30 so-fs11 so-dblock so-mb8">\{st\("Better store level = more fan traffic and reward pickup opportunities\."\)\}<\/Text>/);
  assert.doesNotMatch(ownerSource, /desc: st\("S\/A stores receive stronger fan map and activity exposure\. Risk records can still downrank exposure\."\)/);
  assert.doesNotMatch(ownerSource, /desc: st\("Featured and Recommended stores can appear in fan Home and store event rankings\."\)/);
  assert.doesNotMatch(ownerSource, /desc: rewardPickupPermission/);
  assert.doesNotMatch(ownerSource, /desc: st\("Complete profile photos, campaign participation, fan verification, and material readiness to support level review\."\)/);
  assert.match(css, /\.store-home-value-strip/);
  assert.match(css, /\.store-home-value-grid/);
  assert.match(css, /\.store-home-benefit-chip/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.store-home-value-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
});

test('store home replaces blocking photo reminder modal with an inline nudge', () => {
  assert.match(ownerSource, /store-home-photo-nudge/);
  assert.match(ownerSource, /missingRequiredStorePhotos\.length > 0 &&/);
  assert.match(ownerSource, /setActiveTab\("me"\)/);
  assert.match(ownerSource, /Upload photos/);
  assert.doesNotMatch(ownerSource, /store-photo-reminder-modal/);
  assert.doesNotMatch(ownerSource, /photoReminderModalOpen/);
  assert.doesNotMatch(ownerSource, /setPhotoReminderModalOpen\(true\)/);
  assert.doesNotMatch(ownerSource, /STORE_PHOTO_REMINDER_LIMIT/);
  assert.doesNotMatch(ownerSource, /getPhotoReminderTitle/);
  assert.match(css, /\.store-home-photo-nudge/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.store-home-photo-nudge\s*\{[^}]*grid-template-columns:\s*1fr/s);
});

test('store home command center keeps first-login readiness without duplicate empty-state cards', () => {
  assert.match(ownerSource, /storeHomeCommandItems/);
  assert.match(ownerSource, /store-home-command-head/);
  assert.match(ownerSource, /store-home-command-grid/);
  assert.match(ownerSource, /store-home-command-card/);
  assert.match(ownerSource, /Setup readiness/);
  assert.match(ownerSource, /Fan verification/);
  assert.match(ownerSource, /Campaign execution/);
  assert.match(ownerSource, /Materials/);
  assert.match(ownerSource, /Next best action/);
  assert.match(ownerSource, /Request from your regional warehouse/);
  assert.match(ownerSource, /store-stock-row-meta/);
  assert.match(css, /store-home-command-center/);
  assert.match(css, /store-home-command-grid/);
  assert.match(css, /store-home-command-card/);
  assert.doesNotMatch(ownerSource, /store-readiness-card-grid/);
  assert.doesNotMatch(ownerSource, /store-empty-next-step/);
});

test('store home makes level exposure and reward permissions visible on first screen', () => {
  assert.match(ownerSource, /levelExposureBenefits/);
  assert.match(ownerSource, /Fan map exposure/);
  assert.match(ownerSource, /Home recommendation eligibility/);
  assert.match(ownerSource, /Reward pickup permission/);
  assert.match(ownerSource, /Normal rewards: A\/S stores/);
  assert.match(ownerSource, /Premium rewards: S stores/);
  assert.match(ownerSource, /Upgrade focus/);
  assert.doesNotMatch(ownerSource, /S\/A stores receive stronger fan map and activity exposure/);
  assert.match(css, /store-level-benefit-grid/);
  assert.match(css, /store-level-benefit-card/);
});

test('store home renders level exposure as compact actions without repeated descriptions', () => {
  assert.match(ownerSource, /store-level-compact-grid/);
  assert.match(ownerSource, /store-level-compact-action/);
  assert.doesNotMatch(ownerSource, /<p>\{item\.desc\}<\/p>/);
  assert.match(css, /store-level-compact-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /store-level-compact-action\s*\{[^}]*min-height:\s*64px/s);
});

test('store home lower dashboard panels show status data without explanatory paragraphs', () => {
  assert.match(ownerSource, /store-home-status-card/);
  assert.match(ownerSource, /store-home-campaign-status-card/);
  assert.match(ownerSource, /store-home-data-row/);
  assert.doesNotMatch(ownerSource, /<Text className="so-text-white30 so-fs11 so-dblock so-mb8">\{st\("Track UWELL review feedback for your events, material requests, and store photos\."\)\}<\/Text>/);
  assert.doesNotMatch(ownerSource, /<p>\{item\.type\} · \{item\.desc\}<\/p>/);
  assert.doesNotMatch(ownerSource, /<p>\{st\("Submitted events, material requests, and rejected photos will appear here\."\)\}<\/p>/);
  assert.doesNotMatch(ownerSource, /<p>\{campaignCopy\.description\?\.substring\(0, 72\)\}<\/p>/);
  assert.match(ownerSource, /<span className="store-home-row-meta">\{item\.type\}<\/span>/);
  assert.match(ownerSource, /<span className="store-home-row-meta">\{campaign\.source === "store_application" \? st\("My event"\) : st\("UWELL campaign"\)\}<\/span>/);
  assert.match(css, /\.store-home-data-row/);
  assert.match(css, /\.store-home-row-meta/);
});

test('store app separates official campaigns from store-created events', () => {
  assert.match(ownerSource, /c\.source !== "store_application"/);
  assert.match(ownerSource, /campaign\.source === "store_application" && campaign\.submitted_by_store_id === store\.id/);
  assert.match(ownerSource, /UWELL review decides whether this appears in Fan Activities > Store Events/);
  assert.match(ownerSource, /Cost responsibility acknowledged/);
});

test('store verify and activities render as an operational closure workbench', () => {
  assert.match(ownerSource, /store-verify-workbench/);
  assert.match(ownerSource, /store-verify-action-strip/);
  assert.match(ownerSource, /Verify actions/);
  assert.match(ownerSource, /Fan participation/);
  assert.match(ownerSource, /Manual fallback/);
  assert.match(ownerSource, /Reward redemption/);
  assert.match(ownerSource, /store-verify-method-card/);
  assert.match(ownerSource, /Scan fan member QR/);
  assert.match(ownerSource, /Enter Fan ID or email/);
  assert.match(ownerSource, /store-activity-guidance-strip/);
  assert.match(ownerSource, /store-activity-function-card/);
  assert.match(ownerSource, /Official campaigns/);
  assert.match(ownerSource, /Store-created events/);
  assert.match(ownerSource, /View details, apply, wait for materials, run activity\./);
  assert.match(ownerSource, /Edit content, time, and result\. Send to UWELL review\./);
  assert.match(ownerSource, /Materials, gifts, or costs may need to be handled by the store/);
  assert.doesNotMatch(ownerSource, /Appears in Fan Activities > Store Events after approval/);
  assert.match(css, /store-verify-workbench/);
  assert.match(css, /store-verify-action-strip/);
  assert.match(css, /store-verify-method-card/);
  assert.match(css, /store-activity-guidance-strip/);
});

test('store verify page removes non-action result states and frames top copy as functions', () => {
  assert.doesNotMatch(ownerSource, /const verificationStateTags = \[/);
  assert.doesNotMatch(ownerSource, /store-verify-result-states/);
  assert.doesNotMatch(ownerSource, /title=\{st\("Result states"\)\}/);
  assert.doesNotMatch(ownerSource, /verificationStateTags\.map/);
  assert.doesNotMatch(ownerSource, /Store verifies only\. System checks duplicate, activity, store, time, and risk before awarding points\./);
  assert.doesNotMatch(ownerSource, /System awards points after validation/);
  assert.doesNotMatch(ownerSource, /Store cannot manually add points/);
  assert.match(ownerSource, /Scan fan identity QR to verify participation\./);
  assert.match(ownerSource, /Enter Fan ID or email when QR is unavailable\./);
  assert.match(ownerSource, /Check redemption code before handing over reward\./);
  assert.doesNotMatch(css, /store-verify-result-states/);
});

test('store verify page trims duplicated pickup explanation while preserving operations', () => {
  assert.doesNotMatch(ownerSource, /rewardPickupExecutionItems/);
  assert.doesNotMatch(ownerSource, /store-pickup-execution-lane/);
  assert.match(ownerSource, /Scan fan QR to confirm participation\./);
  assert.doesNotMatch(ownerSource, /Use this when a fan arrives for a Store Event\. Store confirms participation; the system awards points or sends the record to review\./);
  assert.doesNotMatch(ownerSource, /Store users verify pickup only\. Stores verify participation or reward pickup\. The system awards points according to UWELL rules\. Store users do not enter arbitrary point amounts\./);
  assert.match(ownerSource, /Normal: A\/S stores\. Premium: S stores\. Diamond: backend-approved pickup only\./);
  assert.match(ownerSource, /handleVerifyFanParticipation/);
  assert.match(ownerSource, /handleLookupPickupCode/);
  assert.match(ownerSource, /handleConfirmRewardPickup/);
  assert.match(ownerSource, /handleScannerVerify/);
  assert.doesNotMatch(css, /store-pickup-execution-lane/);
});

test('store activities page removes duplicated guidance and moves campaign card colors to CSS', () => {
  assert.match(ownerSource, /store-activity-guidance-strip/);
  assert.match(ownerSource, /store-activity-function-card/);
  assert.match(ownerSource, /Official campaigns/);
  assert.match(ownerSource, /Store-created events/);
  assert.match(ownerSource, /View details, apply, wait for materials, run activity\./);
  assert.match(ownerSource, /Edit content, time, and result\. Send to UWELL review\./);
  assert.doesNotMatch(ownerSource, /Store-created events require approval/);
  assert.doesNotMatch(ownerSource, /Appears in Fan Activities > Store Events after approval/);
  assert.doesNotMatch(ownerSource, /Join ready-made UWELL campaigns when the store wants fast execution\./);
  assert.doesNotMatch(ownerSource, /UWELL reviews rules, fan reward, proof method, and cost risk before publishing\./);
  assert.doesNotMatch(ownerSource, /Pending or rejected events stay internal and never appear to fans\./);
  assert.doesNotMatch(ownerSource, /store-activity-execution-board/);
  assert.doesNotMatch(ownerSource, /Official UWELL campaign/);
  assert.doesNotMatch(ownerSource, /Store-created event review/);
  assert.doesNotMatch(ownerSource, /Execution result status/);
  assert.doesNotMatch(ownerSource, /linear-gradient\(135deg, #1a1a2e 0%, #2a1a0e 100%\)/);
  assert.doesNotMatch(ownerSource, /background: "#1a1a25"/);
  assert.doesNotMatch(ownerSource, /rgba\(255,215,0,0\.2\)/);
  assert.doesNotMatch(ownerSource, /border: camp\.status === "ongoing"/);
  assert.match(ownerSource, /className=\{camp\.status === "ongoing" \? "store-campaign-card-ongoing" : "store-campaign-card-default"\}/);
  assert.match(css, /\.store-campaign-card-ongoing\.ant-card/);
  assert.match(css, /\.store-campaign-card-default\.ant-card/);
  assert.doesNotMatch(css, /store-activity-execution-board/);
  assert.match(ownerSource, /handleClaim/);
  assert.match(ownerSource, /handleOpenReview/);
  assert.match(ownerSource, /reviewStatusColor/);
  assert.match(ownerSource, /reviewStatusLabel/);
});

test('store app separates fan-facing storefront photo and review display photos', () => {
  assert.match(ownerSource, /Store Front Photo/);
  assert.match(ownerSource, /Shown on fan map/);
  assert.match(ownerSource, /Display Photos/);
  assert.match(ownerSource, /Used for level review and display follow-up/);
  assert.doesNotMatch(ownerSource, /First 3 logins/);
});

test('store me page frames photos and regional materials as one operating workbench', () => {
  assert.match(ownerSource, /store-photo-material-workbench/);
  assert.match(ownerSource, /store-photo-reminder-strip/);
  assert.match(ownerSource, /store-me-action-rail/);
  assert.match(ownerSource, /store-material-pack-card/);
  assert.doesNotMatch(ownerSource, /store-photo-purpose-grid/);
  assert.doesNotMatch(ownerSource, /store-material-region-strip/);
  assert.doesNotMatch(ownerSource, /First 3 logins show reminders/);
  assert.doesNotMatch(ownerSource, /missing status stays in Me/);
  assert.doesNotMatch(ownerSource, /Storefront appears on the fan map/);
  assert.doesNotMatch(ownerSource, /Display photos support level review/);
  assert.doesNotMatch(ownerSource, /Requests use the store region warehouse and await backend approval/);
  assert.doesNotMatch(ownerSource, /linear-gradient\(135deg, #1a1a2e 0%, #1a1a0e 100%\)/);
  assert.match(ownerSource, /getStoreWarehouse\(store\)/);
  assert.match(css, /store-photo-material-workbench/);
  assert.match(css, /store-photo-reminder-strip/);
  assert.match(css, /store-me-action-rail/);
  assert.match(css, /store-material-pack-card/);
});

test('store me photo management uses a real scroll target and non-clickable purpose cards', () => {
  assert.match(ownerSource, /useRef/);
  assert.match(ownerSource, /showcaseSectionRef/);
  assert.match(ownerSource, /scrollToShowcaseSection/);
  assert.match(ownerSource, /scrollIntoView\(\{\s*behavior: "smooth",\s*block: "start",\s*\}\)/);
  assert.match(ownerSource, /<Button size="small" onClick=\{scrollToShowcaseSection\}>\{st\("Manage photos"\)\}<\/Button>/);
  assert.match(ownerSource, /<div ref=\{showcaseSectionRef\}>\s*<ShowcaseTab \/>/);
  assert.doesNotMatch(ownerSource, /<button type="button" onClick=\{\(\) => setActiveTab\("me"\)\}>/);
  assert.doesNotMatch(css, /\.store-photo-purpose-grid button/);
});

test('store me showcase starts with photo upload cards instead of a duplicate header card', () => {
  const showcaseBody = ownerSource.match(/const ShowcaseTab = \(\) => \([\s\S]*?\n  \);/)?.[0] ?? "";

  assert.match(showcaseBody, /STORE_PHOTO_TYPES\.map/);
  assert.doesNotMatch(showcaseBody, /so-card-subtle[\s\S]*Store Front Photo & Display Photos/);
});

test('store me materials render as a compact request workbench without stacked repeated cards', () => {
  const materialsBody = ownerSource.match(/const MaterialsTab = \(\) => \([\s\S]*?\n  \);/)?.[0] ?? "";

  assert.match(materialsBody, /store-material-workbench/);
  assert.match(materialsBody, /store-material-pack-grid/);
  assert.match(materialsBody, /store-material-requests-card/);
  assert.match(materialsBody, /store-material-request-row/);
  assert.match(materialsBody, /store-material-catalog-grid/);
  assert.match(materialsBody, /store-material-catalog-item/);
  assert.match(materialsBody, /onClick=\{\(\) => handleRequestMaterial\(m\)\}/);
  assert.doesNotMatch(materialsBody, /<Text strong className="so-text-white50 so-fs12 so-dblock so-mb8">\s*\{t\('store_materials'\)\}\s*<\/Text>/);
  assert.doesNotMatch(materialsBody, /store-dashboard-row[\s\S]*request\.reason/);
  assert.doesNotMatch(materialsBody, /<Card key=\{m\.id\} size="small" className="so-mb6 so-card-dark-border">/);
  assert.match(css, /\.store-material-workbench/);
  assert.match(css, /\.store-material-catalog-grid/);
  assert.match(css, /\.store-material-catalog-item/);
});

test('store me empty photo and material pack states stay compact on mobile', () => {
  assert.match(ownerSource, /className="store-photo-empty-state"/);
  assert.match(css, /\.store-photo-empty-state/);
  assert.match(css, /\.store-photo-empty-state \.ant-empty-image/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.store-material-pack-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.doesNotMatch(css, /@media \(max-width: 640px\)[\s\S]*\.store-material-pack-grid,[\s\S]*grid-template-columns:\s*1fr/s);
});

test('store s report merges execution rhythm into the hero without changing report operations', () => {
  assert.match(ownerSource, /store-s-report-hero-actions/);
  assert.match(ownerSource, /store-s-report-hero-actions[\s\S]*store-execution-command-grid/);
  assert.match(ownerSource, /sStoreReportExecutionItems\.map/);
  assert.doesNotMatch(ownerSource, /<p>\{t\("store_owner_s_report_desc"\)\}<\/p>/);
  assert.doesNotMatch(ownerSource, /<p>\{t\(desc\)\}<\/p>/);
  assert.doesNotMatch(ownerSource, /store-s-report-form-meta/);
  assert.doesNotMatch(ownerSource, /store-s-report-history-meta/);
  assert.doesNotMatch(ownerSource, /store-s-report-execution-lane/);
  assert.doesNotMatch(ownerSource, /t\("store_owner_s_execution_rhythm"\)/);
  assert.doesNotMatch(ownerSource, /t\("store_owner_s_execution_desc"\)/);
  assert.match(ownerSource, /store-s-report-form-grid/);
  assert.match(ownerSource, /handleSubmitSStoreSellThrough/);
  assert.match(ownerSource, /handleSubmitSStoreProductInventory/);
  assert.match(ownerSource, /handleSubmitSStoreMaterialInventory/);
  assert.match(ownerSource, /refreshSStoreReportHistory/);
  assert.match(css, /\.store-s-report-hero-actions/);
  assert.match(css, /\.store-s-report-hero-actions \.store-execution-command-grid/);
  assert.doesNotMatch(css, /\.store-s-report-execution-lane/);
});

test('store app uses S A B C operating labels instead of old metal tiers', () => {
  assert.match(ownerSource, /S Featured Store/);
  assert.match(ownerSource, /A Recommended Store/);
  assert.match(ownerSource, /B Partner Store/);
  assert.match(ownerSource, /C Starter Store/);
  assert.doesNotMatch(ownerSource, /Platinum Store/);
  assert.doesNotMatch(ownerSource, /Gold Store/);
  assert.doesNotMatch(ownerSource, /Silver Store/);
  assert.doesNotMatch(ownerSource, /Bronze Store/);
});

test('store owner hides duplicate top tabs and keeps bottom navigation as the single visible nav', () => {
  assert.match(ownerSource, /className="so-text-light app-liquid-tabs store-owner-content-tabs"/);
  assert.match(css, /\.store-liquid-shell \.store-owner-content-tabs > \.ant-tabs-nav\s*\{[^}]*display:\s*none !important/s);
  assert.doesNotMatch(css, /\.store-liquid-shell \.app-liquid-tabs > \.ant-tabs-nav \.ant-tabs-nav-list\s*\{[^}]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\) !important/s);
  assert.match(css, /\.store-bottom-nav/);
  assert.match(css, /grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.store-bottom-nav button\.is-active/);
});

test('store owner quick action and campaign cards use readable light surfaces', () => {
  assert.match(css, /\.store-liquid-shell \.store-home-command-head\s*\{[^}]*background:\s*linear-gradient\(135deg,\s*rgba\(255,\s*255,\s*255,\s*0\.92\),\s*rgba\(247,\s*255,\s*218,\s*0\.86\)\) !important/s);
  assert.match(css, /\.store-liquid-shell \.store-home-command-head \.so-text-white30,[\s\S]*\.store-liquid-shell \.store-home-command-head strong\s*\{[^}]*color:\s*#17200c !important/s);
  assert.match(css, /\.store-liquid-shell \.store-campaign-card-ongoing\.ant-card\s*\{[^}]*background:\s*linear-gradient\(135deg,\s*rgba\(255,\s*255,\s*255,\s*0\.94\),\s*rgba\(249,\s*255,\s*226,\s*0\.88\)\) !important/s);
  assert.match(css, /\.store-liquid-shell \.store-campaign-card-default\.ant-card\s*\{[^}]*background:\s*rgba\(255,\s*255,\s*255,\s*0\.9\) !important/s);
  assert.doesNotMatch(css, /\.store-liquid-shell \.store-campaign-card-ongoing\.ant-card\s*\{[^}]*#1a1a2e/s);
  assert.doesNotMatch(css, /\.store-liquid-shell \.store-campaign-card-default\.ant-card\s*\{[^}]*#1a1a25/s);
  assert.doesNotMatch(css, /\.store-liquid-shell \.store-home-command-head[\s\S]{0,240}#24320d/s);
});

test('store owner bottom navigation remains fixed above mobile content', () => {
  assert.match(css, /\.store-liquid-shell \.store-bottom-nav\s*\{[^}]*position:\s*fixed !important/s);
  assert.match(css, /\.store-liquid-shell \.store-bottom-nav\s*\{[^}]*bottom:\s*0 !important/s);
  assert.match(css, /\.store-liquid-shell\s*\{[^}]*padding-bottom:\s*calc\(88px \+ env\(safe-area-inset-bottom\)\) !important/s);
});

test('store owner bottom navigation shows compact alert dots from existing workbench state', () => {
  assert.match(ownerSource, /storeBottomNavAlerts/);
  assert.match(ownerSource, /verify:\s*activeStoreCampaigns\.length > 0 && activityVerifyRecords\.length === 0/);
  assert.match(ownerSource, /activities:\s*pendingCampaignClaims\.length > 0 \|\| myStoreEvents\.some/);
  assert.match(ownerSource, /"s-report":\s*isActiveSStoreAccount &&/);
  assert.match(ownerSource, /me:\s*missingRequiredStorePhotos\.length > 0 \|\| lowBundleStock\.length > 0/);
  assert.match(ownerSource, /const hasAlert = Boolean\(storeBottomNavAlerts\[key\]\)/);
  assert.match(ownerSource, /className=\{`store-bottom-nav-button\$\{activeTab === key \? " is-active" : ""\}\$\{hasAlert \? " has-alert" : ""\}`\}/);
  assert.match(ownerSource, /data-tab-key=\{key\}/);
  assert.match(ownerSource, /<span className="store-bottom-nav-icon"><Icon \/><\/span>/);
  assert.match(ownerSource, /\{hasAlert && <span className="store-bottom-nav-dot" aria-hidden="true" \/>\}/);
  assert.match(css, /\.store-bottom-nav button\s*\{[^}]*position:\s*relative/s);
  assert.match(css, /\.store-bottom-nav-icon\s*\{[^}]*position:\s*relative/s);
  assert.match(css, /\.store-liquid-shell \.store-bottom-nav \.store-bottom-nav-icon\s*\{[^}]*display:\s*inline-grid !important/s);
  assert.match(css, /\.store-bottom-nav-dot\s*\{[^}]*position:\s*absolute/s);
  assert.match(css, /\.store-bottom-nav-dot\s*\{[^}]*width:\s*8px/s);
  assert.match(css, /\.store-bottom-nav-dot\s*\{[^}]*background:\s*#ff3b30/s);
});

test('store owner alert dots have matching action-needed strips on target tabs', () => {
  assert.match(ownerSource, /const ActionNeededStrip = \(\{ title, status, actions \}\) =>/);
  assert.match(ownerSource, /className="store-action-needed-strip"/);
  assert.match(ownerSource, /st\("Action needed"\)/);
  assert.match(ownerSource, /activityActionSectionRef/);
  assert.match(ownerSource, /sReportFormSectionRef/);
  assert.match(ownerSource, /materialSectionRef/);
  assert.match(ownerSource, /scrollToActivityActionSection/);
  assert.match(ownerSource, /scrollToSReportFormSection/);
  assert.match(ownerSource, /scrollToMaterialSection/);
  assert.match(ownerSource, /storeBottomNavAlerts\.verify &&/);
  assert.match(ownerSource, /title=\{st\("Verify fan visit"\)\}/);
  assert.match(ownerSource, /onClick:\s*\(\) => setActivityScannerOpen\(true\)/);
  assert.match(ownerSource, /storeBottomNavAlerts\.activities &&/);
  assert.match(ownerSource, /title=\{pendingCampaignClaims\.length > 0 \? st\("Submit campaign result"\) : st\("Check activity review"\)\}/);
  assert.match(ownerSource, /onClick:\s*pendingCampaignClaims\[0\] \? \(\) => handleOpenReview\(pendingCampaignClaims\[0\]\) : scrollToActivityActionSection/);
  assert.match(ownerSource, /storeBottomNavAlerts\["s-report"\] &&/);
  assert.match(ownerSource, /title=\{st\("Submit first S Report"\)\}/);
  assert.match(ownerSource, /onClick:\s*scrollToSReportFormSection/);
  assert.match(ownerSource, /storeBottomNavAlerts\.me &&/);
  assert.match(ownerSource, /title=\{missingRequiredStorePhotos\.length > 0 \? st\("Upload store photos"\) : st\("Request low materials"\)\}/);
  assert.match(ownerSource, /onClick:\s*missingRequiredStorePhotos\.length > 0 \? scrollToShowcaseSection : scrollToMaterialSection/);
  assert.match(css, /\.store-action-needed-strip/);
  assert.match(css, /\.store-action-needed-copy/);
  assert.match(css, /\.store-action-needed-actions/);
});

test('store owner S Report hydrates missing trial history for the demo S Store without changing submissions', () => {
  assert.match(ownerSource, /ensureTrialSStoreReportHistory/);
  assert.match(ownerSource, /activeStore\.id !== "s-real-012"/);
  assert.match(ownerSource, /"s_store_sell_through"/);
  assert.match(ownerSource, /"s_store_product_inventory_snapshots"/);
  assert.match(ownerSource, /"s_store_material_inventory_snapshots"/);
  assert.match(ownerSource, /localDb\.insertBatch\(tableName, trialRows\)/);
  assert.match(ownerSource, /ensureTrialSStoreReportHistory\(activeStore\)/);
  assert.match(ownerSource, /ensureTrialSStoreReportHistory\(store\)/);
  assert.match(ownerSource, /setLocalMode\(true\)/);
  assert.match(ownerSource, /submitSStoreSellThrough/);
  assert.match(ownerSource, /submitSStoreInventory/);
  assert.match(ownerSource, /submitSStoreMaterialInventory/);
});

test('store activities guidance is compact on mobile so campaign cards enter the first screen', () => {
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.store-activity-guidance-strip \.ant-card-body\s*\{[^}]*gap:\s*8px/s);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.store-activity-guidance-grid\s*\{[^}]*gap:\s*6px/s);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.store-activity-function-card\s*\{[^}]*min-height:\s*56px/s);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.store-activity-function-card\s*\{[^}]*padding:\s*10px 12px/s);
  assert.doesNotMatch(css, /\.store-activity-guidance-grid span\s*\{[^}]*display:\s*none/s);
});

test('store activities campaign cards show compact status rows without long descriptions', () => {
  assert.match(ownerSource, /store-campaign-card-body/);
  assert.match(ownerSource, /store-campaign-card-main/);
  assert.match(ownerSource, /store-campaign-card-meta/);
  assert.doesNotMatch(ownerSource, /getCampaignDisplayCopy\(camp\)\.description\?\.substring/);
  assert.doesNotMatch(ownerSource, /<Text className="so-text-white30 so-fs11">\{getCampaignDisplayCopy\(camp\)\.description/);
  assert.match(css, /\.store-campaign-card-body/);
  assert.match(css, /\.store-campaign-card-meta/);
});

test('store owner operational copy stays terse after density sweep', () => {
  [
    'Scan fan identity QR to verify participation.',
    'Enter Fan ID or email when QR is unavailable.',
    'Check redemption code before handing over reward.',
    'Use when camera, QR, or assisted check-in needs fallback.',
    'View details, apply, wait for materials, run activity.',
    'Edit content, time, and result. Send to UWELL review.',
  ].forEach((copy) => assert.ok(ownerSource.includes(copy), `${copy} should be the compact store-owner copy`));
  [
    'This photo will be shown to fans on the store map. A clear storefront or signboard photo helps fans recognize your store and can improve trust and visit intent.',
    'Display Photos are used for UWELL level review, display quality checks, and field follow-up.',
    'Store users do not give points. Store users only verify participation or pickup. System validates duplicate, activity, store, time, and risk rules before points are awarded.',
    'Fallback for camera failure, damaged QR, or staff assisted check-in. It uses the same risk and duplicate validation.',
    'First three logins show strong reminders. After the third login, missing status stays in Me.',
    'Store Front Photo is shown to fans on the store map. Display Photos are used for UWELL level review.',
    'First 3 logins show reminders; missing status stays in Me.',
    'Storefront appears on the fan map',
    'Clear signboard or entrance builds trust.',
    'Display photos support level review',
    'Evidence for upgrade and follow-up.',
    'Storefront appears on map. Display photos support level review.',
    'Requests use the store region warehouse and await backend approval.',
    'Assigned-region inventory only.',
    'Missing photos are reminded during the first three logins only. After the third login, this reminder stops and the missing status stays in Me.',
    'Field reps only see assigned-region inventory.',
    "handles this store's material request flow. Field reps see only assigned-region inventory.",
    'Join ready-made UWELL campaigns when the store wants fast execution.',
    'UWELL reviews rules, fan reward, proof method, and cost risk before publishing.',
    'Pending or rejected events stay internal and never appear to fans.',
  ].forEach((copy) => assert.ok(!ownerSource.includes(copy), `${copy} should not remain as long explanatory copy`));
  assert.match(ownerSource, /handleVerifyFanParticipation/);
  assert.match(ownerSource, /handleDisplayUpload/);
  assert.match(ownerSource, /handleRequestMaterial/);
});

test('store app uses a unified premium workbench shell and tactile UI polish', () => {
  assert.match(ownerSource, /store-premium-workbench-shell/);
  assert.match(ownerSource, /store-dashboard-section store-premium-section/);
  assert.match(ownerSource, /store-verify-workbench store-premium-section-stack/);
  assert.match(ownerSource, /store-photo-material-workbench store-premium-section-stack/);
  assert.match(ownerSource, /store-s-report-workbench store-premium-section-stack/);
  assert.match(css, /--store-premium-radius:\s*18px/);
  assert.match(css, /--store-premium-radius-sm:\s*12px/);
  assert.match(css, /\.store-premium-workbench-shell \.store-dashboard-section/);
  assert.match(css, /\.store-premium-workbench-shell button:active/);
  assert.match(css, /\.store-premium-workbench-shell \.ant-card-head/);
  assert.match(css, /\.store-premium-section-stack/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.store-premium-workbench-shell \.store-dashboard-section/);
});

test('task 136A store workflow keeps core Verify Activities and Me controls while tightening layout', () => {
  assert.match(css, /Task-136A: Store activities verify and account workflow rhythm pass/);
  assert.match(ownerSource, /store-verify-workbench store-premium-section-stack/);
  assert.match(ownerSource, /store-activity-guidance-strip/);
  assert.match(ownerSource, /store-photo-material-workbench store-premium-section-stack/);
  assert.match(ownerSource, /onClick=\{\(\) => setActivityModalOpen\(true\)\}/);
  assert.match(ownerSource, /onClick=\{\(\) => setActivityScannerOpen\(true\)\}/);
  assert.match(ownerSource, /onClick=\{handleVerifyFanParticipation\}/);
  assert.match(ownerSource, /onClick=\{handleLookupPickupCode\}/);
  assert.match(ownerSource, /onClick=\{scrollToShowcaseSection\}/);
  assert.match(ownerSource, /scrollToMaterialSection/);
  assert.doesNotMatch(ownerSource, /popupClassName="store-s-report-calendar-dropdown"/);
  assert.match(ownerSource, /classNames=\{\{ popup: \{ root: "store-s-report-calendar-dropdown" \} \}\}/);
  assert.match(css, /\.store-liquid-shell \.store-activity-guidance-main\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) auto/s);
  assert.match(css, /\.store-liquid-shell \.store-photo-reminder-status \.ant-btn\s*\{[^}]*min-height:\s*44px !important/s);
  assert.match(css, /\.store-liquid-shell \.store-me-action-chip \.ant-tag\s*\{[^}]*min-height:\s*32px !important/s);
  assert.match(css, /\.store-liquid-shell \.store-material-catalog-item span,[\s\S]*\.store-liquid-shell \.store-execution-command-card span\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(css, /\.store-liquid-shell \.store-s-report-workbench \.ant-input-number-input,[\s\S]*\.store-liquid-shell \.store-s-report-workbench \.ant-picker-input > input\s*\{[^}]*height:\s*44px !important/s);
  assert.match(css, /\.store-liquid-shell\.store-premium-workbench-shell\s*\{[^}]*padding-bottom:\s*max\(220px, calc\(188px \+ env\(safe-area-inset-bottom\)\)\) !important/s);
  assert.match(css, /\.store-liquid-shell \.store-material-pack-card \.ant-tag,[\s\S]*\.store-liquid-shell \.store-material-section-head \.ant-tag\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(css, /Task-136A final Store QA override/);
  assert.match(css, /\.store-liquid-shell \.store-material-workbench\s*\{[^}]*padding-bottom:\s*max\(260px, calc\(228px \+ env\(safe-area-inset-bottom\)\)\) !important/s);
  assert.match(css, /\.store-liquid-shell \.store-material-catalog-grid\s*\{[^}]*margin-bottom:\s*max\(360px, calc\(328px \+ env\(safe-area-inset-bottom\)\)\) !important/s);
  assert.match(css, /\.store-liquid-shell \.store-bottom-nav\s*\{[^}]*z-index:\s*1200 !important/s);
  assert.match(css, /\.store-liquid-shell \.store-settings-trigger\s*\{[^}]*min-height:\s*44px !important/s);
  assert.match(css, /\.store-liquid-shell \.ant-tag,[\s\S]*\.store-liquid-shell \.ant-tag \*\s*\{[^}]*font-size:\s*12px !important/s);
});

test('store home merges duplicate command and readiness blocks into one compact command center', () => {
  assert.match(ownerSource, /store-home-command-center/);
  assert.match(ownerSource, /storeHomeCommandItems/);
  assert.match(ownerSource, /storeHomePrimaryAction/);
  assert.match(ownerSource, /store-home-command-head/);
  assert.match(ownerSource, /store-home-command-grid/);
  assert.doesNotMatch(ownerSource, /store-execution-command-strip/);
  assert.doesNotMatch(ownerSource, /store-home-readiness-command/);
  assert.doesNotMatch(ownerSource, /store-readiness-card-grid/);
  assert.doesNotMatch(ownerSource, /store-empty-next-step/);
  assert.match(ownerSource, /todayQueueProgress/);
  assert.match(ownerSource, /setActiveTab\(item\.tab\)/);
  assert.match(css, /\.store-home-command-center/);
  assert.match(css, /\.store-home-command-grid/);
  assert.match(css, /\.store-home-command-card/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.store-home-command-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.store-home-command-card\s*\{[^}]*min-height:\s*74px/s);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.store-home-command-card \.ant-tag\s*\{[^}]*display:\s*none/s);
  assert.doesNotMatch(css, /store-execution-command-strip/);
  assert.doesNotMatch(css, /store-home-readiness-command/);
  assert.doesNotMatch(css, /store-readiness-card-grid/);
  assert.doesNotMatch(css, /store-empty-next-step/);
});

test('store owner Arabic local copy map does not define duplicate labels', () => {
  const copyMapMatch = ownerSource.match(/const STORE_OWNER_AR_COPY = \{([\s\S]*?)\n\};/);
  assert.ok(copyMapMatch, 'STORE_OWNER_AR_COPY should remain inspectable');

  const keys = [...copyMapMatch[1].matchAll(/^\s*"([^"]+)":/gm)].map((match) => match[1]);
  const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index);

  assert.deepEqual(duplicateKeys, []);
});

test('store owner level exposure does not keep unused reward pickup copy', () => {
  assert.doesNotMatch(ownerSource, /const rewardPickupPermission =/);
});
