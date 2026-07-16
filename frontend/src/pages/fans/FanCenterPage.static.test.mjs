import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./FanCenterPage.jsx', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

test('fan center visible copy has no mojibake in core fan paths', () => {
  assert.doesNotMatch(source, /閸檤闂倈娴爘缁墊閼皘閺寍娑搢閳妾殀妫閹磡濞瞸濮閻畖妤爘鐦墊瀵皘褰亅绶潀鐏弢鍛皘閸焲鐓剕鎯鍩寍绨?/);
});

test('fan center uses English consumer-facing home copy', () => {
  assert.match(source, /ensureEnglishFirst\(\)/);
  assert.match(source, /Today at a glance/);
  assert.match(source, /Check in/);
  assert.match(source, /Scan product/);
  assert.match(source, /Recommended activity/);
  assert.match(source, /Nearby UWELL stores/);
  assert.match(source, /Rewards you can aim for/);
  assert.match(source, /key: 'rewards', label: 'Rewards'/);
  assert.match(source, /UWELL Store Display Challenge/);
  assert.match(source, /Open activity/);
  assert.match(source, /Open store map/);
  assert.match(source, /My verification/);
  assert.match(source, /Referral reward/);
  assert.doesNotMatch(source, /View all tasks/);
  assert.doesNotMatch(source, /Visit a verified store/);
  assert.doesNotMatch(source, /Store perks/);
  assert.doesNotMatch(source, /Visit completed/);
  assert.doesNotMatch(source, /Store visit completed/);
});

test('fan home stays light and routes core cards to real fan sections', () => {
  assert.match(source, /const renderHome = \(\) => \(/);
  assert.match(source, /onClick=\{\(\) => handleTaskAction\('checkin'\)\}/);
  assert.match(source, /onClick=\{\(\) => openSecondaryView\('scan', 'home'\)\}/);
  assert.match(source, /onClick=\{\(\) => setActiveView\('activities'\)\}/);
  assert.match(source, /onClick=\{\(\) => setActiveView\('stores'\)\}/);
  assert.match(source, /onClick=\{\(\) => setActiveView\('rewards'\)\}/);
  assert.doesNotMatch(source, /fan-campaign-step-strip/);
  assert.doesNotMatch(source, /campaignSteps\.map/);
});

test('fan home uses focused growth IA for Task-025 visual polish', () => {
  assert.match(source, /fan-home-shell/);
  assert.match(source, /fan-home-mission-control/);
  assert.match(source, /Today's power moves/);
  assert.match(source, /Daily check-in/);
  assert.match(source, /Product scan/);
  assert.match(source, /fan-home-spotlight-grid/);
  assert.match(source, /fan-home-activity-card/);
  assert.match(source, /fan-home-reward-card/);
  assert.match(source, /fan-home-store-card/);
  assert.match(source, /MALL_ITEMS\.slice\(0, 1\)/);
  assert.match(source, /recommendedStores\.slice\(0, 1\)/);
  assert.match(source, /fan-home-recent-card/);
  assert.match(cssSource, /\.fan-shell \.fan-home-shell/);
  assert.match(cssSource, /\.fan-shell \.fan-home-mission-control/);
  assert.match(cssSource, /\.fan-shell \.fan-home-spotlight-grid/);
  assert.match(cssSource, /\.fan-shell \.fan-home-action-card/);
  assert.match(cssSource, /\.fan-shell \.fan-home-recent-card/);
});

test('fan center bottom navigation uses the confirmed six fan sections', () => {
  assert.match(source, /key: 'home', label: 'Home'/);
  assert.match(source, /key: 'activities', label: 'Activities'/);
  assert.match(source, /key: 'community', label: 'Community'/);
  assert.match(source, /key: 'rewards', label: 'Rewards'/);
  assert.match(source, /key: 'stores', label: 'Stores'/);
  assert.match(source, /key: 'me', label: 'Me'/);
  assert.doesNotMatch(source, /key: 'tasks', label: 'Tasks'/);
  assert.doesNotMatch(source, /key: 'mall', label: 'Rewards'/);
  assert.doesNotMatch(source, /key: 'profile', label: 'Me'/);
});

test('fan center bottom navigation is locked to fixed viewport position', () => {
  assert.match(cssSource, /\.fan-shell \.fan-bottom-nav,\s*\.fan-center-liquid-shell \.fan-bottom-nav \{[^}]*position:\s*fixed !important/);
  assert.match(cssSource, /\.fan-shell \.fan-bottom-nav,\s*\.fan-center-liquid-shell \.fan-bottom-nav \{[^}]*bottom:\s*0 !important/);
});

test('fan center keeps old fan entry keys as secondary compatibility routes', () => {
  assert.match(source, /if \(activeView === 'activities'\) return <CampaignTab fan=\{currentFan\} \/>;/);
  assert.match(source, /if \(activeView === 'community'\) return <CommunityTab fan=\{currentFan\} \/>;/);
  assert.match(source, /if \(activeView === 'rewards'\) return <MallTab fan=\{currentFan\} onPointsChange=\{handlePointsChange\} \/>;/);
  assert.match(source, /if \(activeView === 'me'\) return renderProfile\(\);/);
  assert.match(source, /mall: \{ title: t\('fan_redeem'\), content: <MallTab fan=\{currentFan\} onPointsChange=\{handlePointsChange\} \/> \}/);
  assert.match(source, /campaigns: \{ title: t\('fan_activities'\), content: <CampaignTab fan=\{currentFan\} \/> \}/);
  assert.match(source, /profile: \{ title: 'Me', content: renderProfile\(\) \}/);
});

test('fan task daily check-in card performs check-in instead of only navigating', () => {
  assert.match(source, /addFanPoints/);
  assert.match(source, /hasCheckedInToday/);
  assert.match(source, /handleTaskAction/);
  assert.match(source, /handleTaskCheckIn/);
  assert.match(source, /key: 'checkin'[\s\S]*done: hasCheckedInToday/);
  assert.match(source, /await addFanPoints\(currentFan\.id, 5, 'earn', 'Daily Check-in', 'Daily check-in bonus'\);[\s\S]*localDb\.insert\('fan_checkins'/);
  assert.doesNotMatch(source, /key: 'checkin'[\s\S]{0,160}done: true/);
});

test('fan center prioritizes the saved fan session when selecting the current fan', () => {
  assert.match(source, /const savedFanId = localStorage\.getItem\('store_manager_current_user'\)/);
  assert.match(source, /fans\.find\(\(f\) => f\.id === savedFanId\)/);
  assert.match(source, /localDb\.findById\('fans', savedFanId\)/);
});

test('fan center resolves remote Supabase fan by auth user id before local fallback', () => {
  assert.match(source, /const remoteFanByAuthUser = fans\.find\(\(f\) => f\.user_id === user\?\.id\)/);
  assert.match(source, /fans\.find\(\(f\) => f\.user_id === savedFanId\)/);
  assert.match(source, /fans\.find\(\(f\) => f\.user_id === user\?\.id\)/);
  assert.match(source, /remoteFanByAuthUser \|\| remoteFanBySavedAuthUser \|\| savedLocalFan/);
});

test('fan center does not treat local fallback fans as fresh data in Supabase sessions', () => {
  assert.doesNotMatch(source, /initialData:\s*localFallbackFans/);
  assert.match(source, /placeholderData:\s*localFallbackFans/);
});

test('fan center only writes local fallback fan sessions when local fallback is active', () => {
  assert.match(source, /isLocal\(\)/);
  assert.match(source, /canUseLocalFanFallback/);
  assert.match(source, /if \(!currentFan && canUseLocalFanFallback\)/);
  assert.doesNotMatch(source, /if \(!currentFan\) \{\s*const allFans = localDb\.all\('fans'\)/);
});

test('fan me page is an account center with histories and secondary utilities', () => {
  assert.match(source, /fan-me-shell/);
  assert.match(source, /fan-me-hero/);
  assert.match(source, /fan-me-points-card/);
  assert.match(source, /fan-me-overview-strip/);
  assert.match(source, /fan-me-history-panel/);
  assert.match(source, /fan-me-history-list/);
  assert.match(source, /fan-me-empty-row/);
  assert.match(source, /recentPointRows/);
  assert.match(source, /recentRedemptionRows/);
  assert.match(source, /recentScanRows/);
  assert.match(source, /recentActivityRows/);
  assert.match(source, /fan-me-history-grid/);
  assert.match(source, /fan-me-utility-grid/);
  assert.match(source, /fan-me-language-card/);
  assert.match(source, /Account overview/);
  assert.match(source, /Recent activity/);
  assert.match(source, /Points history/);
  assert.match(source, /Reward history/);
  assert.match(source, /Scan history/);
  assert.match(source, /Activity history/);
  assert.match(source, /Invite friends/);
  assert.match(source, /Existing fan verification/);
  assert.match(source, /New user guide/);
  assert.match(source, /<LanguageSwitcher[\s\S]*className="fan-me-language-switcher"/);
  assert.match(cssSource, /\.fan-me-shell/);
  assert.match(cssSource, /\.fan-me-overview-strip/);
  assert.match(cssSource, /\.fan-me-history-panel/);
  assert.match(cssSource, /\.fan-me-history-list/);
  assert.match(cssSource, /\.fan-me-empty-row/);
  assert.match(cssSource, /\.fan-me-history-grid/);
  assert.match(cssSource, /\.fan-me-utility-grid/);
});

test('old fan verification secondary page uses recovered fan styling', () => {
  assert.match(source, /const renderOldFanVerification = \(\) =>/);
  assert.match(source, /fan-verification-page/);
  assert.match(source, /fan-verification-hero/);
  assert.match(source, /fan-verification-status-card/);
  assert.match(source, /fan-verification-upload-card/);
  assert.match(source, /fan-verification-history-list/);
  assert.match(source, /Upload an image showing at least 4 older UWELL products/);
  assert.doesNotMatch(source, /<Card className="fan-panel">[\s\S]*Upload an image showing at least 4 older UWELL products/);
  assert.doesNotMatch(source, /color: 'rgba\(255,255,255,0\.72\)'/);
  assert.match(cssSource, /\.fan-verification-page/);
  assert.match(cssSource, /\.fan-verification-hero/);
  assert.match(cssSource, /\.fan-verification-status-card/);
  assert.match(cssSource, /\.fan-verification-upload-card/);
  assert.match(cssSource, /\.fan-verification-history-list/);
});

test('fan home exposes a stable check-in detail entry separate from instant check-in', () => {
  assert.match(source, /const handleOpenCheckInDetails = \(\) => \{\s*openSecondaryView\('checkin', 'home'\);\s*\};/);
  assert.match(source, /className="fan-home-action-grid fan-checkin-home-actions"/);
  assert.match(source, /onClick=\{\(\) => handleTaskAction\('checkin'\)\}/);
  assert.match(source, /onClick=\{handleOpenCheckInDetails\}/);
  assert.match(source, /View streak/);
  assert.match(source, /checkin: \{ title: 'Daily check-in', content: <CheckInTab fan=\{currentFan\} onPointsChange=\{handlePointsChange\} \/> \}/);
  assert.doesNotMatch(source, /if \(activeView === 'checkin'\) return <CheckInTab fan=\{currentFan\} onPointsChange=\{handlePointsChange\} \/>;/);
  assert.match(cssSource, /\.fan-checkin-home-actions/);
  assert.match(cssSource, /\.fan-checkin-detail-link/);
});

test('fan secondary pages remember their launch source for back navigation', () => {
  assert.match(source, /const \[returnView, setReturnView\] = useState\('home'\);/);
  assert.match(source, /const openSecondaryView = \(view, from = activeView\) => \{/);
  assert.match(source, /setReturnView\(from \|\| 'home'\);[\s\S]*setActiveView\(view\);/);
  assert.match(source, /const handleSecondaryBack = \(\) => \{\s*setActiveView\(returnView \|\| 'home'\);\s*\};/);
  assert.match(source, /onClick=\{handleSecondaryBack\}/);
  assert.match(source, /onClick=\{\(\) => openSecondaryView\('invite', 'me'\)\}/);
  assert.match(source, /onClick=\{\(\) => openSecondaryView\('oldfan', 'me'\)\}/);
  assert.match(source, /onClick=\{\(\) => openSecondaryView\('help', 'me'\)\}/);
});
