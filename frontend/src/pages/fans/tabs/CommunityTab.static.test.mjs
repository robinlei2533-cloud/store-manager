import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./CommunityTab.jsx', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');

test('community tab implements trial point limits for likes comments and posts', () => {
  assert.match(source, /OPERATIONAL_RULE_RECORD_ID/);
  assert.match(source, /mergeOperationalRules/);
  assert.match(source, /communityPointRules/);
  assert.match(source, /communityLikePoints/);
  assert.match(source, /communityLikeDailyLimit/);
  assert.match(source, /communityCommentPoints/);
  assert.match(source, /communityCommentDailyLimit/);
  assert.match(source, /communityPostPoints/);
  assert.match(source, /communityPostDailyLimit/);
  assert.match(source, /fan_real_community_first_post/);
  assert.match(source, /fan_real_community_post_min/);
  assert.match(source, /fan_real_community_comment_min/);
});

test('community tab records comments and prevents self or duplicate like point abuse', () => {
  assert.match(source, /community_comments/);
  assert.match(source, /handleComment/);
  assert.match(source, /author_id:\s*fan\?\.id/);
  assert.match(source, /post\.author_id === fan\?\.id/);
  assert.match(source, /community_point_actions/);
});

test('community tab is structured as a real feed instead of a rules dashboard', () => {
  assert.match(source, /fan-community-feed-shell/);
  assert.match(source, /fan-community-composer/);
  assert.match(source, /fan-community-rule-hint/);
  assert.match(source, /fan-community-feed-list/);
  assert.match(source, /fan-community-post-card/);
  assert.match(source, /fan_real_community_official/);
  assert.match(source, /fan_real_community_fan/);
  assert.match(source, /fan_real_community_share_moment/);
  assert.doesNotMatch(source, /<Row gutter=\{\[8, 8\]\}/);
  assert.doesNotMatch(source, /<Col span=\{8\}/);
});

test('community tab keeps points copy lightweight and interaction-led', () => {
  assert.match(source, /fan_real_community_like'\)} \+1/);
  assert.match(source, /fan_real_community_comment'\)} \+2/);
  assert.match(source, /fan_real_community_first_post'\)} \+10/);
  assert.match(source, /fan-community-post-actions/);
  assert.match(source, /fan-community-comment-box/);
});

test('community tab has a lightweight UWELL product poster and feed media without upload storage', () => {
  assert.match(source, /fan-community-hero-poster/);
  assert.match(source, /fan-community-product-showcase/);
  assert.match(source, /COMMUNITY_HERO_VISUAL/);
  assert.match(source, /fan-refresh-v2\/community-hero\.jpg/);
  assert.match(source, /fan-refresh-v2\/community-feed-1\.jpg/);
  assert.match(source, /fan-refresh-v2\/community-feed-2\.jpg/);
  assert.match(source, /fan-refresh-v2\/community-feed-3\.jpg/);
  assert.match(source, /fan-refresh-v2\/community-feed-4\.jpg/);
  assert.doesNotMatch(source, /fan-refresh\/community-hero\.jpg/);
  assert.match(source, /fan-community-hero-visual/);
  assert.match(source, /getCommunityMediaAsset/);
  assert.match(source, /fan-community-media-card/);
  assert.match(source, /index < 3/);
  assert.doesNotMatch(source, /fan-community-add-photo/);
  assert.doesNotMatch(source, /fan_real_community_photo_soon/);
  assert.doesNotMatch(source, /CameraOutlined/);
  assert.doesNotMatch(source, /image_url/);
  assert.doesNotMatch(source, /media_urls/);
  assert.doesNotMatch(source, /uploadCommunityImage/);
  assert.doesNotMatch(source, /storage\.from/);
});

test('community tab uses the unified fan yellow green theme instead of default antd colors', () => {
  assert.match(source, /fan-community-xp-chip/);
  assert.match(source, /fan-community-comment-submit/);
  assert.match(source, /enterButton=\{<Button className="fan-community-comment-submit">\{t\('fan_real_community_comment'\)\}<\/Button>\}/);
  assert.match(source, /className="fan-community-post-button"/);
  assert.doesNotMatch(source, /<Button type="primary" block[^>]*className="fan-community-post-button"/);
  assert.doesNotMatch(source, /<Tag color=\{post\.audienceLabel === 'Official' \? 'lime' : 'gold'\}/);
  assert.doesNotMatch(source, /<Tag color=\{catColors\[post\.category\] \|\| 'default'\}/);
  assert.match(cssSource, /\.fan-community-comment-submit/);
  assert.match(cssSource, /\.fan-community-comment-box \.ant-input-search-btn/);
  assert.match(cssSource, /\.fan-community-post-button/);
  assert.match(cssSource, /--fan-brand-gradient/);
});

test('community Task-109 shrinks the hero product visual so it no longer dominates the feed header', () => {
  assert.match(source, /fan-community-hero-visual is-compact/);
  assert.match(cssSource, /\/\* Task-109 Fan browser comment correction pass\. \*\//);
  assert.match(cssSource, /\.fan-shell \.fan-community-hero-visual\.is-compact[\s\S]*max-width:\s*174px/);
  assert.match(cssSource, /\.fan-shell \.fan-community-hero-visual\.is-compact[\s\S]*min-height:\s*116px/);
  assert.match(cssSource, /\.fan-shell \.fan-community-hero-visual\.is-compact img[\s\S]*object-fit:\s*contain/);
});

test('community Task-135D keeps comments and feed actions readable without changing point logic', () => {
  assert.match(cssSource, /Task-135D: Fan Community readability and interaction rhythm pass/);
  assert.match(cssSource, /\.fan-shell \.fan-community-comment-count,[\s\S]*\.fan-center-liquid-shell \.fan-community-comment p\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(cssSource, /\.fan-shell \.fan-community-comment-count,[\s\S]*\.fan-center-liquid-shell \.fan-community-comment-count\s*\{[^}]*min-height:\s*30px !important/s);
  assert.match(cssSource, /\.fan-shell \.fan-community-comment-box \.ant-input-search \.ant-input,[\s\S]*\.fan-center-liquid-shell \.fan-community-comment-box \.fan-community-comment-submit\.ant-btn\s*\{[^}]*min-height:\s*44px !important/s);
  assert.match(cssSource, /@media \(max-width: 760px\)[\s\S]*\.fan-shell \.fan-community-product-showcase span,[\s\S]*\.fan-center-liquid-shell \.fan-community-product-showcase span\s*\{[^}]*font-size:\s*12px !important/s);
  assert.match(source, /communityLikeDailyLimit/);
  assert.match(source, /communityCommentDailyLimit/);
  assert.match(source, /communityPostDailyLimit/);
});
