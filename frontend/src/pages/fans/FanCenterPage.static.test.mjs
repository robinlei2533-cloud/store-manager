import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./FanCenterPage.jsx', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');
const translationsSource = readFileSync(new URL('../../utils/translations.js', import.meta.url), 'utf8');

test('fan center visible copy has no mojibake in core fan paths', () => {
  assert.doesNotMatch(source, /閸檤闂倈娴爘缁墊閼皘閺寍娑搢閳妾殀妫閹磡濞瞸濮閻畖妤爘鐦墊瀵皘褰亅绶潀鐏弢鍛皘閸焲鐓剕鎯鍩寍绨?/);
});

test('fan center uses translatable consumer-facing home copy', () => {
  assert.doesNotMatch(source, /ensureEnglishFirst/);
  assert.doesNotMatch(source, /setLang\(['"]en['"]\)/);
  assert.match(source, /t\('fan_real_mission_label'\)/);
  assert.match(translationsSource, /fan_real_mission_label: 'Mission boost'/);
  assert.match(translationsSource, /fan_real_claim_today: 'Claim today'/);
  assert.match(translationsSource, /fan_real_scan_now: 'Scan now'/);
  assert.match(translationsSource, /fan_real_recommended_activity: 'Recommended activity'/);
  assert.match(translationsSource, /fan_real_nearby_stores: 'Nearby UWELL stores'/);
  assert.match(translationsSource, /fan_real_reward_goal: 'Rewards you can aim for'/);
  assert.match(source, /key: 'rewards', label: t\('fan_real_rewards'\)/);
  assert.match(source, /fan_real_activities_campaign_display/);
  assert.match(source, /featuredCampaignKeys/);
  assert.match(translationsSource, /fan_real_join_challenge: 'Join challenge'/);
  assert.match(translationsSource, /fan_real_open_map: 'Open map'/);
  assert.match(translationsSource, /fan_real_my_verification: 'My verification'/);
  assert.match(translationsSource, /fan_real_invite_label: 'Referral reward'/);
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

test('fan center keeps Task-134D lint cleanup from returning', () => {
  assert.doesNotMatch(source, /getStoreExposureScore/);
  assert.doesNotMatch(source, /FireOutlined/);
  assert.doesNotMatch(source, /const fanFeatureItems = \[/);
  assert.doesNotMatch(source, /const campaignSteps = \[/);
  assert.doesNotMatch(source, /const hasCheckedInToday = useMemo\(\(\) =>/);
});

test('fan home preserves Task-025 growth IA inside the Task-093 scroll journey', () => {
  assert.match(source, /fan-home-shell/);
  assert.match(source, /fan-home-journey-section is-actions/);
  assert.match(translationsSource, /fan_real_mission_title: "Today's power moves"/);
  assert.match(translationsSource, /fan_real_daily_checkin: 'Daily check-in'/);
  assert.match(translationsSource, /fan_real_product_scan: 'Product scan'/);
  assert.match(source, /fan-home-action-showcase/);
  assert.match(source, /fan-home-feature-showcase/);
  assert.match(source, /fan-home-activity-card/);
  assert.match(source, /fan-home-reward-card/);
  assert.match(source, /fan-home-store-card/);
  assert.match(source, /MALL_ITEMS\.slice\(0, 1\)/);
  assert.match(source, /recommendedStores\.slice\(0, 1\)/);
  assert.match(source, /fan-home-club-path/);
  assert.match(cssSource, /\.fan-shell \.fan-home-shell/);
  assert.match(cssSource, /\.fan-shell \.fan-home-journey-section/);
  assert.match(cssSource, /\.fan-shell \.fan-home-action-showcase/);
  assert.match(cssSource, /\.fan-shell \.fan-home-feature-showcase/);
  assert.match(cssSource, /\.fan-shell \.fan-home-action-card/);
  assert.match(cssSource, /\.fan-shell \.fan-home-club-path/);
});

test('fan home Task-095 uses UWELL Club naming and a single hero media layer', () => {
  assert.match(source, /<strong>UWELL Club<\/strong>/);
  assert.match(source, /<h1 className="fan-home-hero-title uw-reactbits-split-text">UWELL Club<\/h1>/);
  assert.match(translationsSource, /fan_real_uwell_clubhouse: 'UWELL Club'/);
  assert.match(source, /currentFan\?\.name \|\| 'UWELL Member'/);
  assert.doesNotMatch(source, /UWELL FAN CENTER/);
  assert.doesNotMatch(source, /UWELL Member Club/);
  assert.doesNotMatch(translationsSource, /fan_real_uwell_clubhouse: 'UWELL Clubhouse'/);
  assert.doesNotMatch(source, /className="fan-home-official-product"/);
  assert.doesNotMatch(cssSource, /\.fan-shell \.fan-home-official-product/);
  assert.doesNotMatch(source, /fan-home-recent-inline/);
  assert.doesNotMatch(source, /fan-home-journey-section is-recent/);
});

test('fan home Task-096 shifts to premium brand rhythm with one hero CTA and safe mobile depth', () => {
  assert.match(source, /fan-home-club-path/);
  assert.match(source, /fan-home-member-snapshot/);
  assert.match(source, /renderHomeBrandClubHero\(\)[\s\S]*fan-home-journey-section is-actions[\s\S]*fan-home-journey-section is-activity[\s\S]*fan-home-journey-section is-rewards[\s\S]*fan-home-journey-section is-stores[\s\S]*fan-home-journey-section is-progress/);
  assert.doesNotMatch(source, /fan-home-brand-stats/);
  assert.doesNotMatch(source, /fan-home-secondary-actions/);
  assert.doesNotMatch(source, /fan-home-recent-inline/);
  assert.match(translationsSource, /fan_real_club_path_join: 'Join'/);
  assert.match(translationsSource, /fan_real_club_path_earn: 'Earn'/);
  assert.match(translationsSource, /fan_real_club_path_redeem: 'Redeem'/);
  assert.match(translationsSource, /fan_real_club_path_visit: 'Visit'/);

  assert.match(cssSource, /\.fan-shell \.fan-home-club-path/);
  assert.match(cssSource, /\.fan-shell \.fan-home-member-snapshot/);
  assert.match(cssSource, /\.fan-shell \.fan-home-shell[\s\S]*padding-bottom:\s*max\(140px, calc\(96px \+ env\(safe-area-inset-bottom\)\)\)/);
  assert.match(cssSource, /@media \(max-width: 760px\)[\s\S]*\.fan-shell \.fan-home-reward-showcase[\s\S]*margin-bottom:\s*calc\(36px \+ env\(safe-area-inset-bottom\)\)/);
});

test('fan home Task-097 uses brand-backed sections, readable activity media, and centered avatars', () => {
  assert.match(source, /fan-home-section-backdrop/);
  assert.match(source, /fan-home-transition-band/);
  assert.match(source, /fan-home-activity-media/);
  assert.doesNotMatch(source, /fan-home-card-visual fan-home-visual-panel is-campaign[\s\S]{0,260}<FireOutlined \/>/);
  assert.doesNotMatch(source, /fan-home-card-visual fan-home-visual-panel is-campaign[\s\S]{0,320}<span>XP<\/span>/);

  assert.match(cssSource, /\.fan-shell \.fan-home-journey-section::before/);
  assert.match(cssSource, /\.fan-shell \.fan-home-journey-section\.is-progress::before[\s\S]*fan-lifestyle\.jpg/);
  assert.match(cssSource, /\.fan-shell \.fan-home-transition-band/);
  assert.match(cssSource, /\.fan-shell \.fan-home-activity-media/);
  assert.match(cssSource, /\.fan-shell \.fan-home-activity-media img[\s\S]*object-fit:\s*cover/);
  assert.match(cssSource, /\.fan-shell \.fan-home-journey-section\.is-activity[\s\S]*grid-template-columns:\s*minmax\(0, 0\.64fr\) minmax\(0, 1\.36fr\)/);
  assert.match(cssSource, /\.fan-shell \.fan-home-feature-showcase[\s\S]*grid-template-columns:\s*minmax\(300px, 1\.12fr\) minmax\(0, 0\.88fr\)/);
  assert.match(cssSource, /\.fan-shell \.fan-home-feature-showcase[\s\S]*width:\s*min\(100%, 640px\)/);
  assert.match(cssSource, /\.fan-shell \.fan-shell-avatar[\s\S]*display:\s*inline-grid !important[\s\S]*place-items:\s*center/);
});

test('fan me and stores surfaces use reduced visual-led layouts', () => {
  assert.match(source, /FAN_PROFILE_VISUALS/);
  assert.match(source, /fan-refresh-v2\/me-hero\.jpg/);
  assert.match(source, /fan-refresh-v2\/me-detail-a\.jpg/);
  assert.match(source, /fan-refresh-v2\/me-detail-b\.jpg/);
  assert.match(source, /fan-me-hero-reduced/);
  assert.match(source, /fan-me-hero-visual/);
  assert.match(source, /fan-me-hero-visual-chips/);
  assert.match(source, /fan-me-stat-card is-summary/);
  assert.match(source, /fan-me-history-grid is-compact/);
  assert.match(source, /getStorePreviewVisual/);
  assert.match(source, /STORE_PREVIEW_HERO_VISUAL/);
  assert.match(source, /fan-refresh-v2\/store-hero\.jpg/);
  assert.match(source, /fan-refresh-v2\/store-s\.jpg/);
  assert.match(source, /fan-refresh-v2\/store-a\.jpg/);
  assert.match(source, /fan-refresh-v2\/store-b\.jpg/);
  assert.match(source, /STORE_FALLBACK_VISUALS/);
  assert.match(source, /STORE_PREVIEW_VISUALS\[3\]/);
  assert.match(source, /fan-refresh-v2\/store-gallery\.jpg/);
  assert.doesNotMatch(source, /fan-refresh\/me-hero\.jpg/);
  assert.doesNotMatch(source, /fan-refresh\/store-hero\.jpg/);
  assert.match(source, /fan-store-hero-visual/);
  assert.match(source, /fan-store-hero-tags/);
  assert.match(source, /fan-visible-store-chip[\s\S]*is-muted/);
});

test('fan home Task-026 polish keeps copy short, visual cards unified, and motion scoped', () => {
  assert.match(source, /t\('fan_real_mission_label'\)/);
  assert.match(source, /t\('fan_real_claim_today'\)/);
  assert.match(source, /t\('fan_real_scan_now'\)/);
  assert.match(source, /t\('fan_real_join_challenge'\)/);
  assert.match(source, /t\('fan_real_shop_reward'\)/);
  assert.match(source, /t\('fan_real_open_map'\)/);
  assert.match(source, /fan-home-action-meta/);
  assert.match(source, /fan-home-card-visual/);
  assert.match(source, /fan-home-store-mark/);
  assert.match(source, /fan-home-reward-points/);
  assert.doesNotMatch(source, /Grow your UWELL level with the two fastest actions today\./);
  assert.match(cssSource, /\.fan-shell \.fan-home-action-card:hover/);
  assert.match(cssSource, /\.fan-shell \.fan-home-action-card:active/);
  assert.match(cssSource, /\.fan-shell \.fan-home-card-visual/);
  assert.match(cssSource, /\.fan-shell \.fan-home-card-visual::after/);
  assert.match(cssSource, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(cssSource, /max-width: 640px[\s\S]*\.fan-shell \.fan-home-action-card[\s\S]*min-height: 66px/);
});

test('fan home Task-135E respects reduced motion for the background video loop', () => {
  assert.match(source, /prefersReducedMotion = window\.matchMedia\?\.\('\(prefers-reduced-motion: reduce\)'\)\.matches/);
  assert.match(source, /if \(prefersReducedMotion\) \{\s*video\.style\.opacity = String\(targetOpacity\);/);
  assert.match(source, /const playVideo = \(\) => \{\s*if \(prefersReducedMotion\) return;/);
  assert.match(source, /if \(prefersReducedMotion\) \{\s*video\.pause\(\);[\s\S]*video\.style\.opacity = '1';[\s\S]*return;/);
  assert.match(source, /if \(prefersReducedMotion \|\| !video\.duration \|\| isFadingOut\) return;/);
  assert.match(source, /const handleEnded = \(\) => \{\s*if \(prefersReducedMotion\) return;/);
  assert.match(cssSource, /Task-135E: Fan motion and reduced-motion discipline pass/);
});

test('fan shell theme uses one yellow-green gradient system for header, avatar, nav, and home cards', () => {
  assert.match(cssSource, /--fan-brand-gradient:\s*linear-gradient/);
  assert.match(cssSource, /--fan-brand-surface:\s*linear-gradient/);
  assert.match(cssSource, /\.fan-shell \.fan-shell-header[\s\S]*var\(--fan-brand-surface\)/);
  assert.match(cssSource, /\.fan-shell \.fan-shell-avatar[\s\S]*var\(--fan-brand-gradient\)/);
  assert.match(cssSource, /\.fan-shell \.store-settings-trigger[\s\S]*var\(--fan-brand-soft-gradient\)/);
  assert.match(cssSource, /\.fan-shell \.fan-shell-actions button[\s\S]*var\(--fan-brand-soft-gradient\)/);
  assert.match(cssSource, /\.fan-shell \.fan-shell-level-tag[\s\S]*var\(--fan-brand-soft-gradient\)/);
  assert.match(cssSource, /\.fan-shell \.fan-outline-pill[\s\S]*var\(--fan-brand-soft-gradient\)/);
  assert.match(cssSource, /\.fan-shell \.fan-bottom-nav button\.is-active[\s\S]*var\(--fan-brand-soft-gradient\)/);
  assert.match(cssSource, /\.fan-shell \.fan-home-action-card svg[\s\S]*var\(--fan-brand-gradient\)/);
  assert.match(cssSource, /\.fan-shell \.fan-home-card-visual[\s\S]*var\(--fan-brand-gradient\)/);
  assert.match(cssSource, /\.fan-shell \.fan-home-reward-points[\s\S]*var\(--fan-brand-soft-gradient\)/);
  assert.match(cssSource, /\.fan-shell \.fan-home-store-mark[\s\S]*var\(--fan-brand-gradient\)/);
});

test('fan shell Task-032 unifies header typography, settings dismissal, and premium secondary page radius', () => {
  assert.match(source, /const settingsRef = useRef\(null\);/);
  assert.match(source, /handleSettingsPointerDown/);
  assert.match(source, /handleSettingsKeyDown/);
  assert.match(source, /event\.key === 'Escape'/);
  assert.match(source, /document\.addEventListener\('pointerdown', handleSettingsPointerDown\)/);
  assert.match(source, /document\.removeEventListener\('pointerdown', handleSettingsPointerDown\)/);
  assert.match(source, /document\.addEventListener\('keydown', handleSettingsKeyDown\)/);
  assert.match(source, /document\.removeEventListener\('keydown', handleSettingsKeyDown\)/);
  assert.match(source, /ref=\{settingsRef\}/);
  assert.match(source, /aria-expanded=\{settingsOpen\}/);
  assert.match(source, /<strong>UWELL Club<\/strong>/);
  assert.match(source, /<span>\{t\('fan_real_member_growth'\)\}<\/span>/);
  assert.match(source, /className="fan-subpage-title"/);
  assert.match(cssSource, /--fan-radius-screen:\s*28px/);
  assert.match(cssSource, /\.fan-shell \.fan-shell-brand strong[\s\S]*font-family:\s*inherit/);
  assert.match(cssSource, /\.fan-shell \.fan-secondary-view[\s\S]*border-radius:\s*var\(--fan-radius-screen\)/);
  assert.match(cssSource, /\.fan-shell \.fan-subpage-bar[\s\S]*border-radius:\s*var\(--fan-radius-card\)/);
  assert.match(cssSource, /\.fan-shell button:active[\s\S]*scale\(0\.98\)/);
});

test('task 141 fan center applies ReactBits-inspired effects only to high-value brand and action surfaces', () => {
  assert.match(source, /Task-141 ReactBits-inspired fan center effects/);
  assert.match(source, /className="fan-home-hero-title uw-reactbits-split-text"/);
  assert.match(source, /className="[^"]*fan-home-hero-kicker[^"]*uw-reactbits-shiny-text"/);
  assert.match(source, /className="fan-shell-avatar-button uw-reactbits-specular-button"/);
  assert.match(source, /fan-reactbits-spotlight-card/);
  assert.match(source, /fan-reactbits-counter/);
  assert.match(source, /fan-reactbits-primary-action/);
  assert.match(cssSource, /\.fan-shell \.fan-shell-avatar-button,[\s\S]*\.fan-center-liquid-shell \.fan-shell-avatar-button\s*\{[^}]*min-width:\s*44px !important/s);
  assert.match(cssSource, /\.fan-shell \.fan-home-hero-kicker,[\s\S]*\.fan-center-liquid-shell \.fan-home-hero-kicker\s*\{[^}]*font-size:\s*12px !important/s);
});

test('fan center bottom navigation uses the confirmed six fan sections', () => {
  assert.match(source, /key: 'home', label: t\('fan_real_home'\)/);
  assert.match(source, /key: 'activities', label: t\('fan_real_activities'\)/);
  assert.match(source, /key: 'community', label: t\('fan_real_community'\)/);
  assert.match(source, /key: 'rewards', label: t\('fan_real_rewards'\)/);
  assert.match(source, /key: 'stores', label: t\('fan_real_stores'\)/);
  assert.match(source, /key: 'me', label: t\('fan_real_me'\)/);
  assert.doesNotMatch(source, /key: 'tasks', label: 'Tasks'/);
  assert.doesNotMatch(source, /key: 'mall', label: 'Rewards'/);
  assert.doesNotMatch(source, /key: 'profile', label: 'Me'/);
});

test('fan center bottom navigation is locked to fixed viewport position', () => {
  assert.match(cssSource, /\.fan-shell \.fan-bottom-nav,\s*\.fan-center-liquid-shell \.fan-bottom-nav \{[^}]*position:\s*fixed !important/);
  assert.match(cssSource, /\.fan-shell \.fan-bottom-nav,\s*\.fan-center-liquid-shell \.fan-bottom-nav \{[^}]*bottom:\s*0 !important/);
});

test('fan center Task-101 gives the fixed bottom nav intelligent hide and reveal states', () => {
  assert.match(source, /const \[navVisibility, setNavVisibility\] = useState\('visible'\);/);
  assert.match(source, /const navStableViews = new Set\(\['scan', 'checkin', 'invite', 'oldfan', 'help'\]\);/);
  assert.match(source, /const shouldStabilizeBottomNav = navStableViews\.has\(activeView\);/);
  assert.match(source, /handleFanNavScroll/);
  assert.match(source, /setNavVisibility\('hidden'\)/);
  assert.match(source, /setNavVisibility\('soft'\)/);
  assert.match(source, /setNavVisibility\('visible'\)/);
  assert.match(source, /window\.addEventListener\('scroll', handleFanNavScroll, \{ passive: true \}\)/);
  assert.match(source, /window\.removeEventListener\('scroll', handleFanNavScroll\)/);
  assert.match(source, /window\.setTimeout\(\(\) => \{\s*if \(!shouldStabilizeBottomNav\) setNavVisibility\('soft'\);\s*\}, 700\);/);
  assert.match(source, /fan-bottom-nav \$\{navVisibility === 'hidden' \? 'is-nav-hidden' : ''\}/);
  assert.match(source, /navVisibility === 'soft' \? 'is-nav-soft' : ''/);
  assert.match(source, /shouldStabilizeBottomNav \? 'is-nav-stable' : ''/);
  assert.match(source, /onPointerEnter=\{revealBottomNav\}/);
  assert.match(source, /onFocus=\{revealBottomNav\}/);

  assert.match(cssSource, /\/\* Task-101 Fan bottom navigation intelligent visibility\. \*\//);
  assert.match(cssSource, /\.fan-shell \.fan-bottom-nav[\s\S]*transition:\s*transform 260ms ease, opacity 260ms ease, filter 260ms ease/);
  assert.match(cssSource, /\.fan-shell \.fan-bottom-nav\.is-nav-hidden[\s\S]*transform:\s*translate\(-50%, calc\(100% \+ 28px\)\)/);
  assert.match(cssSource, /\.fan-shell \.fan-bottom-nav\.is-nav-soft[\s\S]*opacity:\s*0\.88/);
  assert.match(cssSource, /\.fan-shell \.fan-bottom-nav\.is-nav-stable[\s\S]*opacity:\s*1/);
  assert.match(cssSource, /@media \(max-width: 899px\)[\s\S]*\.fan-shell \.fan-bottom-nav\.is-nav-hidden[\s\S]*transform:\s*translateY\(calc\(100% \+ 22px\)\)/);
  assert.match(cssSource, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.fan-shell \.fan-bottom-nav[\s\S]*transition:\s*none !important/);
});

test('fan center keeps old fan entry keys as secondary compatibility routes', () => {
  assert.match(source, /if \(activeView === 'activities'\) return <CampaignTab fan=\{currentFan\} \/>;/);
  assert.match(source, /if \(activeView === 'community'\) return <CommunityTab fan=\{currentFan\} \/>;/);
  assert.match(source, /if \(activeView === 'rewards'\) return <MallTab fan=\{currentFan\} onPointsChange=\{handlePointsChange\} \/>;/);
  assert.match(source, /if \(activeView === 'me'\) return renderProfile\(\);/);
  assert.match(source, /mall: \{ title: t\('fan_real_rewards_title'\), content: <MallTab fan=\{currentFan\} onPointsChange=\{handlePointsChange\} \/> \}/);
  assert.match(source, /campaigns: \{ title: t\('fan_real_activities'\), content: <CampaignTab fan=\{currentFan\} \/> \}/);
  assert.match(source, /profile: \{ title: t\('fan_real_me'\), content: renderProfile\(\) \}/);
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
  assert.match(source, /fan-me-history-grid is-compact/);
  assert.match(source, /fan-me-utility-grid/);
  assert.doesNotMatch(source, /fan-me-language-card/);
  assert.match(source, /t\('fan_real_account_overview'\)/);
  assert.match(source, /t\('fan_real_recent_activity'\)/);
  assert.match(source, /t\('fan_real_points_history'\)/);
  assert.match(source, /t\('fan_real_reward_history'\)/);
  assert.match(source, /t\('fan_real_scan_history'\)/);
  assert.match(source, /t\('fan_real_invite_friends'\)/);
  assert.match(source, /invitePointRows/);
  assert.match(source, /invitePointsEarned/);
  assert.match(source, /fan-me-tool-card fan-me-invite-card/);
  assert.match(source, /t\('fan_real_friends_invited'\)/);
  assert.match(source, /t\('fan_real_points_earned'\)/);
  assert.match(source, /t\('fan_real_old_fan_title'\)/);
  assert.match(source, /t\('fan_real_new_user_guide'\)/);
  assert.match(translationsSource, /fan_real_account_overview: 'Account overview'/);
  assert.doesNotMatch(source, /<LanguageSwitcher[\s\S]*className="fan-me-language-switcher"/);
  assert.match(cssSource, /\.fan-me-shell/);
  assert.match(cssSource, /\.fan-me-overview-strip/);
  assert.match(cssSource, /\.fan-me-history-panel/);
  assert.match(cssSource, /\.fan-me-history-list/);
  assert.match(cssSource, /\.fan-me-empty-row/);
  assert.match(cssSource, /\.fan-me-history-grid/);
  assert.match(cssSource, /\.fan-me-utility-grid/);
  assert.match(cssSource, /\.fan-me-invite-card/);
});

test('fan me page uses unified yellow green growth-center styling', () => {
  assert.match(source, /fan-me-growth-hero/);
  assert.match(source, /fan-me-avatar-ring/);
  assert.match(source, /t\('fan_real_growth_center'\)/);
  assert.match(source, /fan-me-hero-actions/);
  assert.match(source, /t\('fan_real_open_rewards'\)/);
  assert.match(source, /t\('fan_real_verify_fan_status'\)/);
  assert.match(source, /fan-me-stat-card is-points/);
  assert.match(source, /fan-me-stat-card is-level/);
  assert.match(source, /fan-me-history-panel is-featured/);
  assert.match(source, /fan-me-quick-card/);
  assert.match(source, /fan-me-tool-card/);
  assert.match(cssSource, /\.fan-me-growth-hero/);
  assert.match(cssSource, /\.fan-me-avatar-ring/);
  assert.match(cssSource, /\.fan-me-hero-actions/);
  assert.match(cssSource, /\.fan-me-stat-card\.is-points/);
  assert.match(cssSource, /\.fan-me-history-panel\.is-featured/);
  assert.match(cssSource, /\.fan-me-quick-card/);
  assert.match(cssSource, /\.fan-me-tool-card/);
  assert.match(cssSource, /\.fan-me-quick-card:hover/);
  assert.match(cssSource, /\.fan-me-tool-card:hover/);
  assert.match(cssSource, /var\(--fan-brand-gradient\)/);
  assert.doesNotMatch(cssSource, /\.fan-me-hero[\s\S]{0,220}linear-gradient\(135deg, #11160a, #25320e/);
});

test('old fan verification secondary page uses recovered fan styling', () => {
  assert.match(source, /const renderOldFanVerification = \(\) =>/);
  assert.match(source, /fan-verification-page/);
  assert.match(source, /fan-verification-hero/);
  assert.match(source, /fan-verification-status-card/);
  assert.match(source, /fan-verification-upload-card/);
  assert.match(source, /fan-verification-history-list/);
  assert.match(source, /fan-verification-hero-visual/);
  assert.match(source, /fan-verification-image-fallback/);
  assert.match(source, /contact-sheet-v2\.jpg/);
  assert.match(source, /onError=\{\(event\) =>/);
  assert.match(source, /t\('fan_real_upload_old_fan_desc'\)/);
  assert.match(translationsSource, /Upload an image showing at least 4 older UWELL products/);
  assert.doesNotMatch(source, /<Card className="fan-panel">[\s\S]*t\('fan_real_upload_old_fan_desc'\)/);
  assert.doesNotMatch(source, /color: 'rgba\(255,255,255,0\.72\)'/);
  assert.match(cssSource, /\.fan-verification-page/);
  assert.match(cssSource, /\.fan-verification-hero/);
  assert.match(cssSource, /\.fan-verification-status-card/);
  assert.match(cssSource, /\.fan-verification-upload-card/);
  assert.match(cssSource, /\.fan-verification-history-list/);
  assert.match(cssSource, /\.fan-verification-hero-visual/);
  assert.match(cssSource, /\.fan-verification-image-fallback/);
});

test('fan home exposes a stable check-in detail entry separate from instant check-in', () => {
  assert.match(source, /const handleOpenCheckInDetails = \(\) => \{\s*openSecondaryView\('checkin', 'home'\);\s*\};/);
  assert.match(source, /className="fan-home-action-showcase[^"]*"/);
  assert.match(source, /onClick=\{\(\) => handleTaskAction\('checkin'\)\}/);
  assert.match(source, /onClick=\{handleOpenCheckInDetails\}/);
  assert.match(source, /t\('fan_real_view_streak'\)/);
  assert.match(source, /checkin: \{ title: t\('fan_real_checkin_title'\), content: <CheckInTab fan=\{currentFan\} onPointsChange=\{handlePointsChange\} \/> \}/);
  assert.doesNotMatch(source, /if \(activeView === 'checkin'\) return <CheckInTab fan=\{currentFan\} onPointsChange=\{handlePointsChange\} \/>;/);
  assert.match(cssSource, /\.fan-shell \.fan-home-action-showcase/);
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

test('fan secondary pages use one unified content shell and interaction polish', () => {
  assert.match(source, /className="fan-secondary-content"/);
  assert.match(cssSource, /\.fan-shell \.fan-secondary-content/);
  assert.match(cssSource, /\.fan-shell \.fan-secondary-content[\s\S]*padding:\s*0 12px 16px/);
  assert.match(cssSource, /\.fan-shell \.fan-scan-cockpit,[\s\S]*\.fan-shell \.fan-guide-help-card[\s\S]*border-radius:\s*var\(--fan-radius-card\)/);
  assert.match(cssSource, /\.fan-shell \.fan-scan-primary-button\.ant-btn-primary,[\s\S]*\.fan-shell \.fan-invite-code-card \.ant-btn-primary[\s\S]*background:\s*var\(--fan-brand-gradient\)/);
  assert.match(cssSource, /\.fan-shell \.fan-me-quick-card:active,[\s\S]*\.fan-shell \.fan-invite-code-card \.ant-btn:active[\s\S]*scale\(0\.98\)/);
  assert.match(cssSource, /\.fan-shell \.fan-guide-channel-grid > article p[\s\S]*color:\s*#4f5d3d/);
  assert.match(cssSource, /\.fan-shell \.fan-invite-hero,[\s\S]*\.fan-shell \.fan-guide-hero[\s\S]*var\(--fan-brand-gradient\)/);
});

test('fan secondary shell Task-107 protects centered titles and bottom-nav safe area', () => {
  assert.match(source, /className="fan-subpage-back"/);
  assert.match(source, /className="fan-subpage-title"/);
  assert.match(source, /className="fan-subpage-spacer"/);
  assert.match(cssSource, /\/\* Task-107 fan secondary shell title and bottom-nav safety\. \*\//);
  assert.match(cssSource, /\.fan-shell \.fan-subpage-bar[\s\S]*grid-template-columns:\s*88px minmax\(0, 1fr\) 88px/);
  assert.match(cssSource, /\.fan-shell \.fan-subpage-title[\s\S]*min-width:\s*0/);
  assert.match(cssSource, /\.fan-shell \.fan-subpage-title[\s\S]*overflow:\s*hidden/);
  assert.match(cssSource, /\.fan-shell \.fan-subpage-title[\s\S]*text-overflow:\s*ellipsis/);
  assert.match(cssSource, /\.fan-shell \.fan-subpage-title[\s\S]*white-space:\s*nowrap/);
  assert.match(cssSource, /\.fan-shell \.fan-secondary-content[\s\S]*padding-bottom:\s*max\(132px, calc\(104px \+ env\(safe-area-inset-bottom\)\)\)/);
  assert.match(cssSource, /html\[dir="rtl"\] \.fan-shell \.fan-subpage-back[\s\S]*justify-self:\s*end/);
  assert.match(cssSource, /html\[dir="rtl"\] \.fan-shell \.fan-subpage-spacer[\s\S]*justify-self:\s*start/);
});

test('fan home Task-108 gives first screen priority to member actions before the long journey', () => {
  assert.match(source, /fan-home-first-screen-lock/);
  assert.doesNotMatch(source, /fan-home-quick-actions-row/);
  assert.doesNotMatch(source, /className="fan-home-quick-action is-checkin"/);
  assert.doesNotMatch(source, /className="fan-home-quick-action is-scan"/);
  assert.match(source, /const renderHome = \(\) => \([\s\S]*renderHomeBrandClubHero\(\)[\s\S]*renderHomeClubPath\(\)[\s\S]*fan-home-journey-section is-actions/);

  assert.match(cssSource, /\/\* Task-108 Fan Home and Rewards first-screen reduction\. \*\//);
  assert.match(cssSource, /\.fan-shell \.fan-home-first-screen-lock/);
  assert.match(cssSource, /\.fan-shell \.fan-home-first-screen-lock \.fan-home-club-path[\s\S]*margin-top:\s*10px/);
  assert.match(cssSource, /@media \(min-width: 761px\) and \(max-width: 980px\)[\s\S]*\.fan-shell \.fan-home-first-screen-lock \.fan-home-cinematic-hero \.fan-home-brand-media[\s\S]*min-height:\s*260px/);
  assert.match(cssSource, /@media \(min-width: 761px\) and \(max-width: 980px\)[\s\S]*\.fan-shell \.fan-home-first-screen-lock \.fan-home-club-path[\s\S]*margin-top:\s*-6px/);
  assert.match(cssSource, /@media \(min-width: 761px\) and \(max-width: 980px\)[\s\S]*\.fan-shell \.fan-home-first-screen-lock \.fan-home-club-path button[\s\S]*min-height:\s*24px/);
  assert.match(cssSource, /@media \(min-width: 761px\) and \(max-width: 980px\)[\s\S]*\.fan-shell \.fan-home-first-screen-lock \.fan-home-club-path button strong[\s\S]*display:\s*none/);
  assert.match(cssSource, /@media \(max-width: 760px\)[\s\S]*\.fan-shell \.fan-home-first-screen-lock \.fan-home-cinematic-hero[\s\S]*min-height:\s*auto/);
  assert.match(cssSource, /@media \(max-width: 760px\)[\s\S]*\.fan-shell \.fan-home-first-screen-lock \.fan-home-brand-media[\s\S]*min-height:\s*clamp\(180px, 44vw, 230px\)/);
  assert.match(cssSource, /@media \(max-width: 760px\)[\s\S]*\.fan-shell \.fan-home-first-screen-lock \.fan-home-club-path[\s\S]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(cssSource, /@media \(max-width: 760px\)[\s\S]*\.fan-shell \.fan-home-first-screen-lock \.fan-home-club-path button strong[\s\S]*display:\s*none/);
});

test('fan center uses a premium brand member shell across the real fan portal', () => {
  assert.match(source, /fan-premium-member-shell/);
  assert.match(source, /fan-brand-culture-strip/);
  assert.match(source, /t\('fan_real_uwell_clubhouse'\)/);
  assert.match(source, /t\('fan_real_official_drops'\)/);
  assert.match(source, /t\('fan_real_brand_store_access'\)/);
  assert.match(source, /t\('fan_real_member_only_growth'\)/);
  assert.match(translationsSource, /fan_real_uwell_clubhouse: 'UWELL Club'/);
  assert.doesNotMatch(source, /preview\/fan/);

  assert.match(cssSource, /--fan-premium-radius:\s*24px/);
  assert.match(cssSource, /--fan-premium-radius-sm:\s*14px/);
  assert.match(cssSource, /\.fan-shell\.fan-premium-member-shell/);
  assert.match(cssSource, /\.fan-shell \.fan-brand-culture-strip/);
  assert.match(cssSource, /\.fan-shell\.fan-premium-member-shell \.fan-member-hero/);
  assert.match(cssSource, /\.fan-shell\.fan-premium-member-shell \.fan-home-activity-card/);
  assert.match(cssSource, /\.fan-shell\.fan-premium-member-shell \.fan-campaign-card/);
  assert.match(cssSource, /\.fan-shell\.fan-premium-member-shell \.fan-reward-card/);
  assert.match(cssSource, /\.fan-shell\.fan-premium-member-shell \.fan-visible-store-card/);
  assert.match(cssSource, /\.fan-shell\.fan-premium-member-shell \.fan-me-growth-hero/);
  assert.match(cssSource, /\.fan-shell\.fan-premium-member-shell button:active/);
  assert.match(cssSource, /@media \(max-width: 640px\)[\s\S]*\.fan-shell \.fan-brand-culture-strip/);
});

test('fan home Task-092 becomes a brand club sample with media space, one primary action, and lighter records', () => {
  assert.match(source, /const renderHomeBrandClubHero = \(\) =>/);
  assert.match(source, /fan-home-brand-club-hero/);
  assert.match(source, /fan-home-brand-media/);
  assert.match(source, /fan-home-real-media-frame/);
  assert.match(source, /fan-home-brand-kicker/);
  assert.match(source, /<h1 className="fan-home-hero-title uw-reactbits-split-text">UWELL Club<\/h1>/);
  assert.match(source, /Earn points\. Unlock rewards\. Visit Brand Stores\./);
  assert.match(source, /fan-home-primary-action/);
  assert.match(source, /hasCheckedInToday \? t\('fan_real_scan_now'\) : t\('fan_real_claim_today'\)/);
  assert.match(source, /fan-home-member-snapshot/);
  assert.match(source, /fan-home-club-path/);
  assert.match(source, /fan-home-hero-status-pill/);
  assert.doesNotMatch(source, /fan-home-brand-stats/);
  assert.doesNotMatch(source, /fan-home-secondary-actions/);
  assert.doesNotMatch(source, /fan-home-recent-inline/);
  assert.doesNotMatch(source, /<section className="fan-home-shell">\s*\{renderMemberHero\(\)\}/);

  assert.match(cssSource, /\.fan-shell \.fan-home-brand-club-hero/);
  assert.match(cssSource, /\.fan-shell \.fan-home-brand-media/);
  assert.match(cssSource, /\.fan-shell \.fan-home-real-media-frame/);
  assert.match(cssSource, /\.fan-shell \.fan-home-primary-action/);
  assert.match(cssSource, /\.fan-shell \.fan-home-member-snapshot/);
  assert.match(cssSource, /\.fan-shell \.fan-home-club-path/);
  assert.match(cssSource, /@media \(max-width: 640px\)[\s\S]*\.fan-shell \.fan-home-brand-club-hero/);
});

test('fan home Task-093 uses a scroll journey, desktop whitespace, and official UWELL product media', () => {
  assert.match(source, /const FAN_HOME_OFFICIAL_MEDIA/);
  assert.match(source, /https:\/\/files\.myuwell\.com\/uwell\/product\/caliburn-g5\/pc\/pic1\.webp/);
  assert.match(source, /fan-home-hero-video/);
  assert.match(source, /fan-home-journey-section is-progress/);
  assert.match(source, /fan-home-journey-section is-actions/);
  assert.match(source, /fan-home-journey-section is-activity/);
  assert.match(source, /fan-home-journey-section is-rewards/);
  assert.match(source, /fan-home-journey-section is-stores/);
  assert.doesNotMatch(source, /fan-home-recent-inline/);
  assert.match(source, /fan-home-section-copy/);
  assert.match(source, /fan-home-progress-showcase/);
  assert.match(source, /fan-home-action-showcase/);
  assert.match(source, /fan-home-feature-showcase/);
  assert.match(source, /fan-home-reward-showcase/);
  assert.match(source, /fan-home-store-showcase/);
  assert.doesNotMatch(source, /<section className="fan-home-mission-control">/);
  assert.doesNotMatch(source, /<section className="fan-home-spotlight-grid">/);

  assert.match(cssSource, /\.fan-shell-main[\s\S]*max-width:\s*1120px/);
  assert.match(cssSource, /\.fan-shell \.fan-home-shell[\s\S]*gap:\s*clamp\(42px, 8vw, 92px\)/);
  assert.match(cssSource, /\.fan-shell \.fan-home-brand-club-hero[\s\S]*margin-bottom:\s*clamp\(64px, 8vw, 104px\)/);
  assert.match(cssSource, /\.fan-shell \.fan-home-journey-section/);
  assert.match(cssSource, /\.fan-shell \.fan-home-section-copy/);
  assert.match(cssSource, /\.fan-shell \.fan-home-hero-video/);
  assert.match(cssSource, /\.fan-shell \.fan-home-progress-showcase/);
  assert.match(cssSource, /\.fan-shell \.fan-home-action-showcase/);
  assert.match(cssSource, /\.fan-shell \.fan-home-feature-showcase/);
  assert.match(cssSource, /\.fan-shell \.fan-home-reward-showcase/);
  assert.match(cssSource, /\.fan-shell \.fan-home-store-showcase/);
  assert.match(cssSource, /@media \(min-width: 1024px\)[\s\S]*\.fan-shell \.fan-home-journey-section/);
  assert.match(cssSource, /@media \(max-width: 760px\)[\s\S]*\.fan-shell \.fan-home-brand-club-hero[\s\S]*padding-bottom:\s*18px/);
});

test('fan home Task-094 uses official UWELL video and image rhythm across the brand journey', () => {
  assert.match(source, /const FAN_HOME_OFFICIAL_VIDEO/);
  assert.match(source, /https:\/\/files\.myuwell\.com\/uwell\/product\/caliburn-g4\/theme\.mp4/);
  assert.match(source, /const FAN_HOME_VISUAL_ASSETS/);
  assert.match(source, /\/uwell-assets\/fan-lifestyle\.jpg/);
  assert.match(source, /caliburn-g5-lite\/pc\/spe3-lite\.webp/);
  assert.match(source, /caliburn-g4-pro-koko\/pc\/p1\.webp/);
  assert.match(source, /caliburn-g4\/pc\/1\.webp/);
  assert.match(source, /\/uwell-assets\/g5-ugc-display\.jpg/);
  assert.match(source, /fan-home-hero-video/);
  assert.match(source, /autoPlay/);
  assert.match(source, /muted/);
  assert.match(source, /playsInline/);
  assert.match(source, /poster=\{FAN_HOME_OFFICIAL_MEDIA\}/);
  assert.match(source, /fan-home-hero-status-pill/);
  assert.match(source, /fan-home-hero-quickline/);
  assert.match(source, /fan-home-visual-panel is-growth/);
  assert.match(source, /fan-home-visual-panel is-tasks/);
  assert.match(source, /fan-home-visual-panel is-campaign/);
  assert.match(source, /fan-home-visual-panel is-reward/);
  assert.match(source, /fan-home-visual-panel is-store/);
  assert.match(source, /loading="lazy"/);
  assert.doesNotMatch(source, /fan-home-visual-note/);

  assert.match(cssSource, /\.fan-shell \.fan-home-hero-video/);
  assert.match(cssSource, /\.fan-shell \.fan-home-hero-status-pill/);
  assert.match(cssSource, /\.fan-shell \.fan-home-hero-quickline/);
  assert.match(cssSource, /\.fan-shell \.fan-home-visual-panel/);
  assert.match(cssSource, /\.fan-shell \.fan-home-visual-panel\.is-growth/);
  assert.match(cssSource, /\.fan-shell \.fan-home-visual-panel\.is-tasks/);
  assert.match(cssSource, /\.fan-shell \.fan-home-visual-panel\.is-campaign/);
  assert.match(cssSource, /\.fan-shell \.fan-home-visual-panel\.is-reward/);
  assert.match(cssSource, /\.fan-shell \.fan-home-visual-panel\.is-store/);
  assert.match(cssSource, /@media \(max-width: 760px\)[\s\S]*\.fan-shell \.fan-home-hero-video/);
});

test('fan home Task-098 locks the premium brand story system instead of a repeated card stack', () => {
  assert.match(source, /fan-home-story-path/);
  assert.match(source, /fan-home-today-strip/);
  assert.match(source, /fan-home-drop-poster/);
  assert.match(source, /fan-home-reward-shelf/);
  assert.match(source, /fan-home-store-atmosphere/);
  assert.match(source, /fan-home-growth-status/);
  assert.match(source, /t\('fan_real_activity_story_title'\)/);
  assert.match(source, /t\('fan_real_today_story_title'\)/);
  assert.match(source, /t\('fan_real_growth_story_title'\)/);
  assert.doesNotMatch(source, /<h2>\{displayCampaign\?\.name \|\| t\('fan_real_activities'\)\}<\/h2>/);

  assert.match(translationsSource, /fan_real_activity_story_title: ["']Join activities["']/);
  assert.match(translationsSource, /fan_real_today_story_title: ["']Build today.s streak["']/);
  assert.match(translationsSource, /fan_real_mission_desc: 'Build your UWELL streak.'/);
  assert.match(translationsSource, /fan_real_store_map_preview_desc: 'Find trusted UWELL stores near you.'/);

  assert.match(cssSource, /\/\* Task-098 Fan Home premium brand system lock\. \*\//);
  assert.match(cssSource, /\.fan-shell \.fan-home-story-path/);
  assert.match(cssSource, /\.fan-shell \.fan-home-today-strip/);
  assert.match(cssSource, /\.fan-shell \.fan-home-drop-poster/);
  assert.match(cssSource, /\.fan-shell \.fan-home-reward-shelf/);
  assert.match(cssSource, /\.fan-shell \.fan-home-store-atmosphere/);
  assert.match(cssSource, /\.fan-shell \.fan-home-growth-status/);
  assert.match(cssSource, /@media \(min-width: 900px\)[\s\S]*\.fan-shell \.fan-bottom-nav[\s\S]*width:\s*min\(720px, calc\(100vw - 48px\)\)/);
  assert.match(cssSource, /@media \(min-width: 900px\)[\s\S]*\.fan-shell \.fan-bottom-nav button\.is-active[\s\S]*background:\s*rgba\(204, 255, 0, 0\.16\)/);
  assert.match(cssSource, /@media \(max-width: 760px\)[\s\S]*\.fan-shell \.fan-home-journey-section\.is-activity[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(cssSource, /@media \(max-width: 760px\)[\s\S]*\.fan-shell \.fan-home-drop-poster[\s\S]*justify-self:\s*stretch/);
});

test('fan home Task-099 tightens the brand editor pass with cleaner media, copy, and section rhythm', () => {
  assert.match(source, /fan-home-brand-editor-lock/);
  assert.match(source, /fan-home-cinematic-hero/);
  assert.match(source, /fan-home-premium-transition/);
  assert.match(source, /fan-home-section-media-copy/);
  assert.match(source, /fan-home-brand-progress-immersive/);
  assert.match(source, /fan-home-clean-media/);
  assert.match(source, /fan-home-subtle-cta/);
  assert.match(source, /<h1 className="fan-home-hero-title uw-reactbits-split-text">UWELL Club<\/h1>/);
  assert.match(source, /currentFan\?\.name \|\| 'UWELL Member'/);
  assert.doesNotMatch(source, /UWELL Fans Club/);
  assert.doesNotMatch(source, /UWELL Member Club/);
  assert.doesNotMatch(source, /UWELL Clubhouse/);

  assert.match(cssSource, /\/\* Task-099 Fan Home brand editor lock\. \*\//);
  assert.match(cssSource, /\.fan-shell \.fan-home-brand-editor-lock/);
  assert.match(cssSource, /\.fan-shell \.fan-home-cinematic-hero/);
  assert.match(cssSource, /\.fan-shell \.fan-home-cinematic-hero \.fan-home-brand-media[\s\S]*min-height:\s*clamp\(360px, 48vw, 560px\)/);
  assert.match(cssSource, /\.fan-shell \.fan-home-clean-media::after[\s\S]*content:\s*none/);
  assert.match(cssSource, /\.fan-shell \.fan-home-clean-media svg,[\s\S]*\.fan-shell \.fan-home-clean-media > span[\s\S]*display:\s*none/);
  assert.match(cssSource, /\.fan-shell \.fan-home-section-media-copy[\s\S]*background:\s*linear-gradient\(135deg, rgba\(16, 22, 11, 0\.84\), rgba\(16, 22, 11, 0\.46\)\)/);
  assert.match(cssSource, /\.fan-shell \.fan-home-brand-progress-immersive[\s\S]*grid-template-columns:\s*minmax\(320px, 1\.08fr\) minmax\(0, 0\.92fr\)/);
  assert.match(cssSource, /\.fan-shell \.fan-home-brand-progress-immersive \.fan-home-section-copy[\s\S]*background:\s*linear-gradient\(135deg, rgba\(255, 253, 244, 0\.86\), rgba\(255, 253, 244, 0\.52\)\)/);
  assert.match(cssSource, /\.fan-shell \.fan-home-subtle-cta\.ant-btn[\s\S]*background:\s*rgba\(16, 22, 11, 0\.88\)/);
  assert.match(cssSource, /@media \(max-width: 760px\)[\s\S]*\.fan-shell \.fan-home-cinematic-hero \.fan-home-brand-media[\s\S]*min-height:\s*320px/);
});

test('fan home Task-100 fixes member card overlap, clearer journey copy, and two-action daily logic', () => {
  assert.match(source, /fan-home-member-snapshot is-layout-locked/);
  assert.match(source, /fan-home-hero-line/);
  assert.match(source, /window\.scrollTo\(\{ top: 0, left: 0, behavior: 'auto' \}\)/);
  assert.match(source, /\}, \[activeView\]\)/);
  assert.match(source, /Earn points\. Unlock rewards\. Visit Brand Stores\./);
  assert.doesNotMatch(source, /Unlock drops/);
  assert.match(source, /fan-home-path-index/);
  assert.match(source, /<span className="fan-home-path-index">01<\/span>/);
  assert.match(source, /<span className="fan-home-path-index">02<\/span>/);
  assert.match(source, /<span className="fan-home-path-index">03<\/span>/);
  assert.match(source, /<span className="fan-home-path-index">04<\/span>/);
  assert.match(source, /fan-home-daily-actions-lock/);
  assert.match(source, /fan-home-task-atmosphere/);
  assert.match(source, /className=\{`fan-home-action-card fan-reactbits-spotlight-card is-checkin/);
  assert.match(source, /className="fan-home-action-card fan-reactbits-spotlight-card is-scan"/);
  assert.match(translationsSource, /fan_real_official_drops: 'Member rewards'/);
  assert.match(translationsSource, /fan_real_activity_story_title: 'Join activities'/);
  assert.doesNotMatch(translationsSource, /Join this month.s UWELL challenge/);

  assert.match(cssSource, /\/\* Task-100 Fan Home layout discipline\. \*\//);
  assert.match(cssSource, /\.fan-shell \.fan-home-member-snapshot\.is-layout-locked/);
  assert.match(cssSource, /\.fan-shell \.fan-home-member-snapshot\.is-layout-locked \.fan-shell-avatar[\s\S]*flex:\s*0 0 36px/);
  assert.match(cssSource, /\.fan-shell \.fan-home-member-snapshot\.is-layout-locked > div[\s\S]*min-width:\s*96px/);
  assert.match(cssSource, /\.fan-shell \.fan-home-path-index/);
  assert.match(cssSource, /\.fan-shell \.fan-home-daily-actions-lock/);
  assert.match(cssSource, /\.fan-shell \.fan-home-member-snapshot\.is-layout-locked \+ \.fan-home-primary-action[\s\S]*margin-top:\s*14px/);
  assert.match(cssSource, /\.fan-shell \.fan-home-hero-line[\s\S]*animation:\s*fan-home-line-pulse/);
  assert.match(cssSource, /\.fan-shell \.fan-home-daily-actions-lock[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(132px, 1fr\)\)/);
  assert.match(cssSource, /\.fan-shell \.fan-home-task-atmosphere[\s\S]*pointer-events:\s*none/);
  assert.match(cssSource, /\.fan-shell \.fan-home-task-atmosphere[\s\S]*position:\s*absolute/);
  assert.match(cssSource, /\.fan-shell \.fan-home-reward-shelf \.fan-home-visual-panel\.is-reward img[\s\S]*object-fit:\s*contain/);
  assert.match(cssSource, /\.fan-shell \.fan-home-reward-shelf \.fan-home-visual-panel\.is-reward img[\s\S]*transform:\s*scale\(0\.86\)/);
  assert.match(cssSource, /@media \(min-width: 900px\) and \(max-height: 760px\)[\s\S]*\.fan-shell \.fan-home-cinematic-hero[\s\S]*calc\(100vh - 190px\)/);
  assert.match(cssSource, /@media \(min-width: 900px\) and \(max-height: 760px\)[\s\S]*\.fan-shell \.fan-home-cinematic-hero \.fan-home-brand-media[\s\S]*calc\(100vh - 240px\)/);
  assert.match(cssSource, /\.fan-shell \.fan-subpage-bar \.ant-btn[\s\S]*background:\s*rgba\(16, 22, 11, 0\.88\)/);
  assert.match(cssSource, /\.fan-shell \.fan-subpage-bar \.ant-btn[\s\S]*color:\s*#fbffed !important/);
});

test('fan home Task-133B keeps the official video as the first-screen media instead of covering it with a poster image', () => {
  assert.match(source, /fan-home-real-media-frame/);
  assert.match(source, /<div className="fan-home-real-media-frame" aria-label="UWELL official video preview">[\s\S]*<video[\s\S]*className="fan-home-hero-video"[\s\S]*src=\{FAN_HOME_OFFICIAL_VIDEO\}/);
  assert.match(source, /poster=\{FAN_HOME_OFFICIAL_MEDIA\}/);
  assert.match(source, /fan-home-media-storyline/);
  assert.doesNotMatch(source, /fan-home-real-media-poster/);
  assert.doesNotMatch(source, /fan-home-media-placeholder/);

  assert.match(cssSource, /\/\* Task-133A Fan Home real media hierarchy\. \*\//);
  assert.match(cssSource, /\.fan-shell \.fan-home-real-media-frame/);
  assert.doesNotMatch(cssSource, /\.fan-shell \.fan-home-real-media-poster/);
  assert.match(cssSource, /\.fan-shell \.fan-home-real-media-frame \.fan-home-hero-video[\s\S]*z-index:\s*1/);
  assert.match(cssSource, /\.fan-shell \.fan-home-media-storyline/);
  assert.match(cssSource, /\.fan-shell \.fan-home-cinematic-hero \.fan-home-brand-media[\s\S]*min-height:\s*clamp\(260px, 34vw, 390px\)/);
  assert.match(cssSource, /@media \(max-width: 760px\)[\s\S]*\.fan-shell \.fan-home-cinematic-hero \.fan-home-brand-media[\s\S]*min-height:\s*clamp\(210px, 54vw, 270px\)/);
  assert.match(cssSource, /@media \(min-width: 900px\) and \(max-height: 620px\)[\s\S]*\.fan-shell \.fan-home-cinematic-hero \.fan-home-primary-action[\s\S]*max-width:\s*240px/);
});

test('fan Task-109 corrects browser-commented shell profile stores and home regressions', () => {
  assert.doesNotMatch(source, /const renderHomeQuickActions/);
  assert.doesNotMatch(source, /\{renderHomeQuickActions\(\)\}/);
  assert.doesNotMatch(source, /fan-home-quick-actions-row/);
  assert.match(source, /className="fan-shell-avatar-button[^"]*"/);
  assert.match(source, /aria-label=\{t\('fan_real_open_me'\)\}/);
  assert.match(source, /onClick=\{\(\) => setActiveView\('me'\)\}/);
  assert.match(source, /className=\{`fan-level-badge is-\$\{levelValue\}\$\{compact \? ' is-compact' : ''\}`\}/);
  assert.match(source, /LevelBadge levelInfo=\{levelInfo\} compact/);
  assert.doesNotMatch(source, /fan-me-language-card/);
  assert.doesNotMatch(source, /fan-me-language-switcher/);
  assert.match(source, /fan-store-hero fan-store-hero-compact/);
  assert.doesNotMatch(source, /<p>\{t\('fan_real_store_map_preview_desc'\)\}<\/p>/);

  assert.match(cssSource, /\/\* Task-109 Fan browser comment correction pass\. \*\//);
  assert.match(cssSource, /\.fan-shell \.fan-shell-avatar-button/);
  assert.match(cssSource, /\.fan-shell \.fan-level-badge/);
  assert.match(cssSource, /\.fan-shell \.fan-level-badge\.is-silver/);
  assert.match(cssSource, /\.fan-shell \.fan-level-badge\.is-compact/);
  assert.match(cssSource, /\.fan-shell \.fan-store-hero-compact/);
  assert.match(cssSource, /\.fan-shell \.fan-store-hero-compact \.fan-store-hero-copy h2[\s\S]*font-size:\s*clamp\(30px, 5vw, 48px\)/);
  assert.match(cssSource, /\.fan-shell \.fan-store-hero-compact \.fan-store-hero-visual[\s\S]*max-width:\s*260px/);
  assert.match(cssSource, /\.fan-shell \.fan-me-hero-reduced \.fan-me-hero-visual\.is-compact[\s\S]*max-width:\s*140px/);
});
