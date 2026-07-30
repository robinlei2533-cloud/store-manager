import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8');

test('shared admin and store modals keep readable light form surfaces', () => {
  assert.match(css, /\.ant-modal \.ant-modal-container/);
  assert.match(css, /\.ant-modal \.ant-modal-content/);
  assert.match(css, /\.ant-modal \.ant-modal-footer/);
  assert.match(css, /\.ant-modal \.ant-select-selection-placeholder/);
  assert.match(css, /\.ant-modal \.ant-select-selection-item/);
  assert.match(css, /box-shadow:\s*0 24px 72px/);
  assert.match(css, /\.ant-modal\s*\{\s*background:\s*transparent !important;/);
});

test('trial fan navigation and community actions stay usable on mobile', () => {
  assert.match(css, /Trial-operation QA polish/);
  assert.match(css, /\.fan-center-liquid-shell \.fan-bottom-nav/);
  assert.match(css, /grid-template-columns:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\)\s*!important/);
  assert.match(css, /\.fan-community-action-btn/);
  assert.match(css, /min-height:\s*36px\s*!important/);
  assert.match(css, /\.admin-liquid-shell \.ant-btn-link/);
  assert.match(css, /\.store-rating-link/);
  assert.match(css, /\.admin-liquid-shell \.ant-input/);
  assert.match(css, /\.admin-liquid-shell \.ant-select-selector/);
  assert.match(css, /\.admin-liquid-shell \.ant-pagination-total-text/);
  assert.match(css, /\.admin-liquid-shell \.ant-input-number-handler-wrap/);
  assert.match(css, /min-height:\s*44px\s*!important/);
  assert.match(css, /\.admin-liquid-shell \.ant-table-cell span/);
  assert.match(css, /\.admin-liquid-shell \.ant-table-cell a\s*\{/);
  assert.match(css, /\.admin-liquid-shell \.dash-insight-card div/);
  assert.match(css, /\.fan-task-card-footer/);
  assert.match(css, /"footer footer"/);
  assert.doesNotMatch(css, /"points action"/);
  assert.match(css, /\.fan-shell \.fan-status-chip-row \.ant-tag/);
  assert.match(css, /\.store-stock-row-meta/);
  assert.match(css, /\.admin-liquid-shell \.admin-risk-cockpit \.admin-ops-mini-card strong/);
  assert.match(css, /\.admin-liquid-shell \.admin-risk-cockpit \.ant-timeline-item-content/);
  assert.match(css, /\.fan-reward-actions \.ant-btn-primary/);
  assert.match(css, /\.fan-reward-actions \.ant-btn\[disabled\]/);
  assert.match(css, /\.fan-center-liquid-shell \.fan-reward-card \.ant-tag-default/);
  assert.match(css, /\.fan-map-legend/);
  assert.match(css, /\.fan-shell \.fan-activity-cta-label/);
  assert.match(css, /\.fan-shell \.fan-store-trust-note/);
  assert.match(css, /\.store-queue-priority/);
  assert.match(css, /\.fan-shell \.fan-member-hero \.fan-profile-id/);
  assert.match(css, /\.fan-shell \.fan-member-balance-row\s*\{/);
  assert.match(css, /\.fan-shell \.fan-member-balance-row span/);
  assert.match(css, /\.fan-shell \.fan-next-reward-target \.ant-progress-text/);
  assert.match(css, /\.fan-shell \.fan-home-mission-control h3/);
  assert.match(css, /\.fan-shell \.fan-mission-card-grid small/);
  assert.match(css, /Fan\/store maturity polish/);
  assert.match(css, /\.fan-shell \.fan-activity-action-card/);
  assert.match(css, /\.fan-center-liquid-shell \.fan-store-card/);
  assert.match(css, /\.store-liquid-shell \.store-dashboard-stat/);
  assert.match(css, /background-color:\s*#fffdf4\s*!important/);
  assert.match(css, /\.store-liquid-shell \.store-home-command-head/);
  assert.match(css, /Trial-launch readability closeout/);
  assert.match(css, /\.fan-shell \.fan-home-reminder-card strong/);
  assert.match(css, /\.fan-shell \.fan-recommended-activity-card h2/);
  assert.match(css, /\.fan-center-liquid-shell \.fan-reward-lock-reason/);
  assert.match(css, /\.fan-shell \.fan-visible-store-card/);
  assert.match(css, /\.fan-center-liquid-shell \.fan-visible-store-card strong/);
  assert.match(css, /\.store-liquid-shell \.store-bottom-nav button span/);
  assert.match(css, /\.admin-liquid-shell \.so-text-white30/);
  assert.match(css, /\.admin-liquid-shell \.admin-review-action-ladder \.admin-ops-row strong/);
  assert.match(css, /\.admin-liquid-shell \.admin-reward-fulfillment-ladder \.admin-ops-row strong/);
  assert.match(css, /\.admin-liquid-shell \.admin-scan-boundary-ladder \.admin-ops-row strong/);
  assert.match(css, /Trial-launch contrast hardening/);
  assert.match(css, /\.fan-center-liquid-shell \.fan-home-mission-control \.ant-btn-primary span/);
  assert.match(css, /\.fan-center-liquid-shell \.fan-map-legend span/);
  assert.match(css, /\.store-liquid-shell \.store-bottom-nav button\.is-active span/);
  assert.match(css, /\.admin-liquid-shell \.ant-picker-input > input/);
});

test('admin contrast pass keeps light workspace text readable across core controls', () => {
  assert.match(css, /Task-130V: Admin-wide light workspace contrast pass/);
  assert.match(css, /\.admin-liquid-shell \.ant-card-head-title/);
  assert.match(css, /\.admin-liquid-shell \.ant-card-extra/);
  assert.match(css, /\.admin-liquid-shell \.ant-tabs-tab-btn/);
  assert.match(css, /\.admin-liquid-shell \.ant-alert-title/);
  assert.match(css, /\.admin-liquid-shell \.ant-alert-description/);
  assert.match(css, /\.admin-liquid-shell \.ant-btn-default/);
  assert.match(css, /\.admin-liquid-shell \.ant-pagination/);
  assert.match(css, /\.admin-liquid-shell \.admin-reward-cockpit/);
  assert.match(css, /\.admin-liquid-shell \.s-store-command-head/);
  assert.match(css, /\.admin-liquid-shell \.admin-campaign-progress-row > span\s*\{[^}]*color:\s*rgba\(36,\s*28,\s*16,\s*0\.82\)\s*!important;/s);
  assert.match(css, /color:\s*#1f1a12\s*!important/);
  assert.match(css, /color:\s*rgba\(36,\s*28,\s*16,\s*0\.82\)\s*!important/);
});

test('task 131 three portal polish locks readable nav type floor and bottom safe areas', () => {
  assert.match(css, /Task-131: Three-portal UI readability and motion polish/);
  assert.match(css, /\.fan-shell \.fan-bottom-nav button span,[\s\S]*\.fan-center-liquid-shell \.fan-bottom-nav button span\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(css, /\.store-liquid-shell \.store-bottom-nav button span\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(css, /\.fan-shell-main\s*\{[^}]*padding-bottom:\s*max\(132px, calc\(112px \+ env\(safe-area-inset-bottom\)\)\) !important/s);
  assert.match(css, /\.store-liquid-shell\s*\{[^}]*padding-bottom:\s*calc\(108px \+ env\(safe-area-inset-bottom\)\) !important/s);
  assert.match(css, /\.fan-reward-mall-shell,[\s\S]*\.fan-me-shell\s*\{[^}]*padding-bottom:\s*max\(148px, calc\(124px \+ env\(safe-area-inset-bottom\)\)\) !important/s);
});

test('task 131 hardens fan store and admin contrast hotspots without repeating the admin-wide pass', () => {
  assert.match(css, /\.fan-shell \.fan-shell-header,[\s\S]*\.fan-center-liquid-shell \.fan-shell-header\s*\{[^}]*background:\s*rgba\(255,\s*253,\s*244,\s*0\.96\) !important/s);
  assert.match(css, /\.fan-shell \.fan-mini-label,[\s\S]*\.fan-center-liquid-shell \.fan-mini-label\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(css, /\.store-liquid-shell \.so-fs10,[\s\S]*\.store-liquid-shell \.so-fs11\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(css, /\.store-liquid-shell \.store-home-value-strip,[\s\S]*\.store-liquid-shell \.store-campaign-card-body\s*\{[^}]*color:\s*#17200c !important/s);
  assert.match(css, /\.admin-liquid-shell \.admin-ref-brand-sub\s*\{[^}]*color:\s*rgba\(255,\s*255,\s*255,\s*0\.78\) !important/s);
  assert.match(css, /\.admin-liquid-shell \.layout-role-tag\s*\{[^}]*min-height:\s*24px !important/s);
});

test('task 131 limits decorative infinite motion under reduced motion', () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.fan-shell \.fan-home-hero-line,[\s\S]*\.fan-shell \.fan-home-line-pulse,[\s\S]*\.pulse-dot\s*\{[^}]*animation:\s*none !important/s);
});

test('task 135A fan home and account pass reserves nav clearance and readable labels', () => {
  assert.match(css, /Task-135A: Fan Home and account readability pass/);
  assert.match(css, /\.fan-shell \.fan-bottom-nav button span\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(css, /\.fan-shell-main\s*\{[^}]*padding-bottom:\s*max\(168px, calc\(144px \+ env\(safe-area-inset-bottom\)\)\) !important/s);
  assert.match(css, /\.fan-shell \.fan-home-shell,[\s\S]*\.fan-shell \.fan-me-shell\s*\{[^}]*padding-bottom:\s*max\(220px, calc\(196px \+ env\(safe-area-inset-bottom\)\)\) !important/s);
  assert.match(css, /\.fan-shell \.fan-home-mission-control \.fan-mini-label,[\s\S]*\.fan-shell \.fan-home-action-card span,[\s\S]*\.fan-shell \.fan-me-points-card span,[\s\S]*\.fan-shell \.fan-me-overview-strip span,[\s\S]*\.fan-shell \.fan-me-overview-strip small\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(css, /\.fan-shell \.fan-me-history-row span,[\s\S]*\.fan-shell \.fan-me-history-grid button span,[\s\S]*\.fan-shell \.fan-me-utility-grid button span\s*\{[^}]*font-size:\s*12px !important/s);
});

test('task 135B fan rewards keeps readable chips actions and bottom clearance', () => {
  assert.match(css, /Task-135B: Fan Rewards readability and card rhythm pass/);
  assert.match(css, /\.fan-shell \.fan-reward-mall-shell,[\s\S]*\.fan-center-liquid-shell \.fan-reward-mall-shell\s*\{[^}]*padding-bottom:\s*max\(244px, calc\(216px \+ env\(safe-area-inset-bottom\)\)\) !important/s);
  assert.match(css, /\.fan-shell \.fan-reward-filter-bar button,[\s\S]*\.fan-center-liquid-shell \.fan-reward-filter-bar button\s*\{[^}]*min-height:\s*44px !important;[^}]*font-size:\s*12px !important/s);
  assert.match(css, /\.fan-shell \.fan-reward-category-count,[\s\S]*\.fan-center-liquid-shell \.fan-reward-category-count\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(css, /\.fan-shell \.fan-reward-chip,[\s\S]*\.fan-center-liquid-shell \.fan-reward-level-pill\s*\{[^}]*min-height:\s*28px !important;[^}]*font-size:\s*12px !important/s);
  assert.match(css, /\.fan-shell \.fan-reward-actions \.ant-btn,[\s\S]*\.fan-center-liquid-shell \.fan-reward-redeem-button\s*\{[^}]*min-height:\s*44px !important/s);
  assert.match(css, /\.fan-shell \.fan-reward-rules-toggle,[\s\S]*\.fan-center-liquid-shell \.fan-reward-rules-toggle\s*\{[^}]*min-height:\s*44px !important/s);
  assert.match(css, /\.fan-shell \.fan-reward-summary-strip span,[\s\S]*\.fan-center-liquid-shell \.fan-reward-policy-list li\s*\{[^}]*font-size:\s*12px !important/s);
});

test('task 135C fan stores keeps map and service cards readable', () => {
  assert.match(css, /Task-135C: Fan Stores readability and service-card rhythm pass/);
  assert.match(css, /\.fan-shell \.fan-stores-preview,[\s\S]*\.fan-center-liquid-shell \.fan-map-page\s*\{[^}]*padding-bottom:\s*max\(244px, calc\(216px \+ env\(safe-area-inset-bottom\)\)\) !important/s);
  assert.match(css, /\.fan-shell \.fan-store-hero-tags span,[\s\S]*\.fan-center-liquid-shell \.fan-map-marker\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(css, /\.fan-shell \.fan-visible-store-card,[\s\S]*\.fan-center-liquid-shell \.fan-visible-store-card\s*\{[^}]*grid-template-columns:\s*88px minmax\(0, 1fr\) minmax\(88px, auto\) !important/s);
  assert.match(css, /\.fan-shell \.fan-visible-store-copy p,[\s\S]*\.fan-center-liquid-shell \.fan-map-photo-note\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(css, /\.fan-shell \.fan-store-navigate-link,[\s\S]*\.fan-center-liquid-shell \.fan-map-navigate-button\s*\{[^}]*min-height:\s*44px !important;[^}]*font-size:\s*12px !important/s);
});

test('task 135D fan community keeps feed text and controls readable', () => {
  assert.match(css, /Task-135D: Fan Community readability and interaction rhythm pass/);
  assert.match(css, /\.fan-shell \.fan-community-feed-shell,[\s\S]*\.fan-center-liquid-shell \.fan-community-feed-shell\s*\{[^}]*padding-bottom:\s*max\(244px, calc\(216px \+ env\(safe-area-inset-bottom\)\)\) !important/s);
  assert.match(css, /\.fan-shell \.fan-community-product-showcase span,[\s\S]*\.fan-center-liquid-shell \.fan-community-comment p\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(css, /\.fan-shell \.fan-community-action-btn,[\s\S]*\.fan-center-liquid-shell \.fan-community-comment-box \.fan-community-comment-submit\.ant-btn\s*\{[^}]*min-height:\s*44px !important;[^}]*font-size:\s*12px !important/s);
  assert.match(css, /\.fan-shell \.fan-community-comment-box,[\s\S]*\.fan-center-liquid-shell \.fan-community-comment-box\s*\{[^}]*border-top:\s*1px solid rgba\(40, 54, 18, 0\.10\)/s);
});

test('task 135E fan motion keeps decorative animation scoped and reduced motion quiet', () => {
  assert.match(css, /Task-135E: Fan motion and reduced-motion discipline pass/);
  assert.match(css, /--fan-motion-standard:\s*220ms/);
  assert.match(css, /\.fan-shell \.ant-card,[\s\S]*\.fan-center-liquid-shell \.ant-card\s*\{[^}]*animation-duration:\s*var\(--fan-motion-page\) !important/s);
  assert.match(css, /\.fan-shell \.fan-home-action-card,[\s\S]*\.fan-center-liquid-shell \.fan-community-post-card\s*\{[^}]*transition-duration:\s*var\(--fan-motion-standard\) !important/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.fan-shell \.fan-home-hero-line,[\s\S]*\.fan-center-liquid-shell \.fan-activity-detail-poster::after,[\s\S]*\.fan-center-liquid-shell \.pulse-dot\s*\{[^}]*animation:\s*none !important/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.fan-shell \*,[\s\S]*\.fan-center-liquid-shell \*::after\s*\{[^}]*scroll-behavior:\s*auto !important/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.fan-shell \.fan-bottom-nav,[\s\S]*\.fan-center-liquid-shell \.fan-community-post-card\s*\{[^}]*transition:\s*none !important;[^}]*transform:\s*none !important/s);
});

test('task 136A store workbench locks bottom clearance and compact operation rhythm', () => {
  assert.match(css, /Task-136A: Store activities verify and account workflow rhythm pass/);
  assert.match(css, /\.store-liquid-shell \.store-verify-workbench,[\s\S]*\.store-liquid-shell \.store-photo-material-workbench\s*\{[^}]*padding-bottom:\s*max\(260px, calc\(228px \+ env\(safe-area-inset-bottom\)\)\) !important/s);
  assert.match(css, /\.store-liquid-shell \.store-action-needed-strip \.ant-btn,[\s\S]*\.store-liquid-shell \.store-verify-inline-form \.ant-btn,[\s\S]*\{[^}]*min-height:\s*44px !important/s);
  assert.match(css, /\.store-liquid-shell \.store-verify-action-grid > div,[\s\S]*\.store-liquid-shell \.store-activity-function-card\s*\{[^}]*min-height:\s*56px !important/s);
  assert.match(css, /\.store-liquid-shell \.store-verify-action-grid span,[\s\S]*\.store-liquid-shell \.store-activity-function-card span\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(css, /\.store-liquid-shell \.store-me-action-chip\s*\{[^}]*min-height:\s*72px !important/s);
  assert.match(css, /\.store-liquid-shell\.store-premium-workbench-shell\s*\{[^}]*padding-bottom:\s*max\(220px, calc\(188px \+ env\(safe-area-inset-bottom\)\)\) !important/s);
  assert.match(css, /\.store-liquid-shell \.store-material-pack-card \.ant-tag,[\s\S]*\.store-liquid-shell \.store-material-section-head \.ant-tag\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(css, /Task-136A final Store QA override/);
  assert.match(css, /\.store-liquid-shell \.store-material-workbench\s*\{[^}]*padding-bottom:\s*max\(260px, calc\(228px \+ env\(safe-area-inset-bottom\)\)\) !important/s);
  assert.match(css, /\.store-liquid-shell \.store-material-catalog-grid\s*\{[^}]*margin-bottom:\s*max\(360px, calc\(328px \+ env\(safe-area-inset-bottom\)\)\) !important/s);
  assert.match(css, /\.store-liquid-shell \.store-bottom-nav\s*\{[^}]*z-index:\s*1200 !important/s);
  assert.match(css, /\.store-liquid-shell \.store-settings-trigger\s*\{[^}]*min-height:\s*44px !important/s);
  assert.match(css, /\.store-liquid-shell \.ant-tag,[\s\S]*\.store-liquid-shell \.ant-tag \*\s*\{[^}]*font-size:\s*12px !important/s);
});

test('task 140 full portal finish pass locks store s report admin and motion polish', () => {
  assert.match(css, /Task-140: Authorized full follow-up UI finish pass/);
  assert.match(css, /\.store-liquid-shell \.store-s-report-mode-bar\s*\{[^}]*display:\s*grid !important/s);
  assert.match(css, /\.store-liquid-shell \.store-s-report-form-panel::before\s*\{[^}]*content:\s*attr\(data-step\)/s);
  assert.match(css, /\.store-liquid-shell \.store-s-report-history-card \.store-dashboard-row\s*\{[^}]*min-height:\s*64px !important/s);
  assert.match(css, /--store-motion-fast:\s*160ms/);
  assert.match(css, /--store-motion-standard:\s*220ms/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.store-liquid-shell \*,[\s\S]*\.store-liquid-shell \*::after\s*\{[^}]*animation:\s*none !important;[^}]*transition:\s*none !important/s);
  assert.match(css, /\.admin-liquid-shell \.admin-ref-brand\s*\{[^}]*background:\s*#253123 !important/s);
  assert.match(css, /\.admin-liquid-shell \.ant-table-cell \.ant-btn,[\s\S]*\.admin-liquid-shell \.ant-card-extra \.ant-btn,[\s\S]*\{[^}]*min-height:\s*36px !important/s);
  assert.match(css, /\.admin-liquid-shell \.admin-dashboard-scan-band\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /\.admin-liquid-shell \.admin-dashboard-secondary-programs\s*\{[^}]*margin-top:\s*8px/s);
});

test('task 141 reactbits-inspired UI effects stay brand aligned and reduced-motion safe', () => {
  assert.match(css, /Task-141: ReactBits-inspired fan and login interaction polish/);
  assert.match(css, /--uw-reactbits-motion-fast:\s*160ms/);
  assert.match(css, /\.uw-reactbits-split-text\s*\{[^}]*animation:\s*uwReactBitsSplitRise/s);
  assert.match(css, /\.uw-reactbits-shiny-text::after\s*\{[^}]*animation:\s*uwReactBitsShine/s);
  assert.match(css, /\.uw-reactbits-specular-button::before\s*\{[^}]*background:\s*linear-gradient\(115deg/s);
  assert.match(css, /\.uw-reactbits-field :is\(input, textarea, select\):focus,[\s\S]*\.uw-reactbits-field \.ant-input-affix-wrapper-focused\s*\{[^}]*box-shadow:\s*0 0 0 3px rgba\(204, 255, 0, 0\.22\)/s);
  assert.match(css, /\.fan-shell \.fan-reactbits-spotlight-card::before,[\s\S]*\.fan-center-liquid-shell \.fan-reactbits-spotlight-card::before\s*\{[^}]*radial-gradient/s);
  assert.match(css, /\.fe-settings-trigger-light,[\s\S]*\.fe-modal-close\s*\{[^}]*min-width:\s*44px !important/s);
  assert.match(css, /\.fe-entry-wishline,[\s\S]*\.fe-luxury-benefit-step small\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(css, /\.fe-luxury-brand \.fe-entry-wishline,[\s\S]*\.fan-center-liquid-shell \.fan-next-reward-target small\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(css, /\.fan-shell \.fan-home-member-snapshot\.is-layout-locked span/);
  assert.match(css, /\.store-entry-page \.store-entry-language\s*\{[^}]*background:\s*rgba\(248, 255, 232, 0\.92\) !important/s);
  assert.match(css, /\.staff-login-green-theme \.staff-login-copy\s*\{[^}]*background:\s*rgba\(248, 255, 232, 0\.78\) !important/s);
  assert.match(css, /\.fan-shell \.fan-header-language button,[\s\S]*\.fan-center-liquid-shell \.fan-checkin-detail-link\.ant-btn\s*\{[^}]*min-height:\s*44px !important/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.uw-reactbits-split-text,[\s\S]*\.uw-reactbits-shiny-text::after,[\s\S]*\.uw-reactbits-click-spark::after,[\s\S]*\{[^}]*animation:\s*none !important/s);
});
