import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./FanEntryPage.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

test('fan entry visible copy has no mojibake characters', () => {
  const mojibakePattern = /[\u95c1\u95bc\u940e\u9420\u95bb]/;
  assert.doesNotMatch(source, mojibakePattern);
});

test('fan registration form uses polished English consumer-facing labels', () => {
  assert.doesNotMatch(source, /ensureEnglishFirst\(\)/);
  assert.doesNotMatch(source, /setLang\('en'\)/);
  assert.match(source, /Join in under one minute/);
  assert.match(source, /Earn your first 100 points/);
  assert.match(source, /Scan products, join campaigns, and redeem rewards/);
  assert.match(source, /You will enter your member center after sign-up/);
  assert.match(source, /placeholder="Name \*"/);
  assert.match(source, /placeholder="Email \*"/);
  assert.match(source, /placeholder="Password \*"/);
  assert.match(source, /placeholder="Phone \(optional\)"/);
  assert.match(source, />Country \*</);
  assert.match(source, />City \*</);
  assert.match(source, /I confirm I am of legal age in my region\./);
  assert.match(source, /I agree to the <a[\s\S]*privacy notice[\s\S]*member terms[\s\S]*<\/a>\./);
});

test('fan registration modal stays usable on short screens and has a return path', () => {
  assert.match(source, /className="fe-auth-modal[^"]*"/);
  assert.match(source, /className="fe-register-back"/);
  assert.match(source, /Back to sign in/);
  assert.match(source, /setMode\('login'\)/);
  assert.match(source, /setAuthOpen\(false\)/);
});

test('fan entry keeps the orb-style product hero instead of flat product placement', () => {
  assert.match(source, /CaliburnHeroCanvas/);
  assert.match(source, /<CaliburnHeroCanvas products=\{PD\} \/>/);
  assert.doesNotMatch(source, /fe-luxury-products/);
  assert.doesNotMatch(source, /fe-luxury-product/);
});

test('fan entry centers the primary sign-in action and moves the wish line to the brand corner', () => {
  assert.match(source, /<small className="fe-entry-wishline uw-reactbits-shiny-text">I Wish You Well<\/small>/);
  assert.match(source, /className="fe-luxury-center-action"/);
  assert.match(source, /className="fe-luxury-support"/);
  assert.match(source, /<div className="fe-luxury-copy uw-split-reveal[^"]*">[\s\S]*<button type="button" className="fe-luxury-cta/);
  assert.match(source, /<div className="fe-luxury-support">[\s\S]*fe-luxury-benefit-dock/);
  assert.doesNotMatch(source, /<p aria-label="I Wish You Well">/);
});

test('fan entry center sign-in button returns to a black and white high-contrast style', () => {
  assert.match(css, /fe-luxury-copy \.fe-luxury-cta[\s\S]*background: #050505/);
  assert.match(css, /fe-luxury-copy \.fe-luxury-cta[\s\S]*color: #fff/);
  assert.match(css, /fe-luxury-copy \.fe-luxury-cta span[\s\S]*background: #fff/);
  assert.match(css, /fe-luxury-copy \.fe-luxury-cta span[\s\S]*color: #050505/);
  assert.doesNotMatch(css, /fe-luxury-copy \.fe-luxury-cta[\s\S]*linear-gradient\(135deg, #f9ff46, #ccff00 48%, #7ee000\)/);
});

test('fan entry explains platform value as a numbered benefit dock', () => {
  assert.match(source, /const entryBenefitSteps = \[/);
  assert.match(source, /01[\s\S]*Join UWELL Fans/);
  assert.match(source, /02[\s\S]*Get welcome points/);
  assert.match(source, /03[\s\S]*Scan products and join campaigns/);
  assert.match(source, /04[\s\S]*Redeem member rewards/);
  assert.match(source, /className="fe-luxury-benefit-dock"/);
  assert.match(source, /entryBenefitSteps\.map/);
  assert.doesNotMatch(source, /Join UWELL fans, check activities, scan for points, and redeem member rewards\./);
  assert.match(css, /fe-luxury-support[\s\S]*right: 38px/);
  assert.match(css, /fe-luxury-support[\s\S]*text-align: right/);
});

test('fan entry primary CTA is clickable above the decorative hero layers', () => {
  assert.match(css, /fe-luxury-copy[\s\S]*pointer-events: none/);
  assert.match(css, /fe-luxury-copy \.fe-luxury-cta[\s\S]*pointer-events: auto/);
  assert.match(css, /fe-luxury-copy \.fe-luxury-cta[\s\S]*position: relative/);
  assert.match(css, /fe-luxury-copy \.fe-luxury-cta[\s\S]*z-index: 6/);
});

test('fan entry benefit dock stays visually compact on the first screen', () => {
  assert.match(css, /Task-132: Fan entry CTA hit area and compact benefit dock/);
  assert.match(css, /fe-luxury-support[\s\S]*width: min\(320px, calc\(100vw - 76px\)\)/);
  assert.match(css, /fe-luxury-benefit-step[\s\S]*padding: 7px 0/);
  assert.match(css, /fe-luxury-benefit-step small[\s\S]*font-size: 10px/);
  assert.match(css, /@media \(max-width: 860px\)[\s\S]*fe-luxury-benefit-step small[\s\S]*display: none/);
  assert.match(css, /@media \(max-height: 760px\)[\s\S]*fe-luxury-benefit-step small[\s\S]*display: none/);
});

test('fan entry keeps hero copy and CTA inside the viewport on short desktop screens', () => {
  assert.match(css, /Task-158: Fan entry short desktop viewport correction/);
  assert.match(css, /fe-luxury-copy\.uw-reactbits-split-text[\s\S]*animation: none !important/);
  assert.match(css, /@media \(min-width: 861px\) and \(max-height: 680px\)/);
  assert.match(css, /@media \(min-width: 861px\) and \(max-height: 680px\)[\s\S]*\.fe-luxury-copy[\s\S]*left: 50% !important/);
  assert.match(css, /@media \(min-width: 861px\) and \(max-height: 680px\)[\s\S]*\.fe-luxury-copy[\s\S]*width: min\(520px, calc\(100vw - 360px\)\) !important/);
  assert.match(css, /@media \(min-width: 861px\) and \(max-height: 680px\)[\s\S]*\.fe-luxury-copy h1[\s\S]*font-size: clamp\(34px, 4\.1vw, 50px\) !important/);
  assert.match(css, /@media \(min-width: 861px\) and \(max-height: 680px\)[\s\S]*\.fe-luxury-canvas[\s\S]*opacity: 0\.82/);
  assert.match(css, /@media \(min-width: 861px\) and \(max-height: 680px\)[\s\S]*\.fe-luxury-support[\s\S]*width: min\(300px, calc\(100vw - 80px\)\)/);
});

test('fan registration respects Supabase Auth-created profiles before writing fan records', () => {
  assert.doesNotMatch(source, /from\("profiles"\)\.upsert/);
  assert.match(source, /from\("profiles"\)[\s\S]*\.select\("id"\)[\s\S]*\.maybeSingle\(\)/);
  assert.match(source, /from\("fans"\)\.insert\(records\.fan\)/);
});

test('fan remote login does not silently fall back to local auth when fallback is disabled', () => {
  assert.match(source, /isLocalAuthFallbackEnabled/);
  assert.match(source, /if \(!isLocalAuthFallbackEnabled\(\)\) \{[\s\S]*Login failed\. Please check your email and password\.[\s\S]*return;/);
  assert.match(source, /if \(!isLocalAuthFallbackEnabled\(\)\)[\s\S]*signInLocal/);
});

test('task 141 fan entry uses restrained ReactBits-inspired hero and modal interactions', () => {
  assert.match(source, /Task-141 ReactBits-inspired entry effects/);
  assert.match(source, /className="fe-luxury-copy uw-split-reveal uw-reactbits-split-text"/);
  assert.match(source, /className="fe-entry-wishline uw-reactbits-shiny-text"/);
  assert.match(source, /className="fe-luxury-cta uw-reactbits-specular-button/);
  assert.match(source, /className="fe-auth-modal uw-reactbits-fade-content"/);
  assert.match(source, /className="fe-input-group fe-input-field uw-reactbits-field"/);
  assert.match(css, /\.fe-entry-wishline/);
  assert.match(css, /\.fe-auth-modal\.uw-reactbits-fade-content/);
});
