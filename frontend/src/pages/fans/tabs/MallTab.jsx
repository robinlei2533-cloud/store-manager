import React, { useEffect, useState } from 'react';
import { message, Button, Modal, Typography } from 'antd';
import { GiftOutlined, StarOutlined } from '@ant-design/icons';
import localDb from '../../../services/db/localDb';
import { addFanPoints, createRewardRedemptionRemote } from '../../../services/api';
import { MALL_ITEMS } from '../../../utils/constants';
import { createPendingRedemption } from '../../../utils/reward-redemption';
import { rewardRules } from '../../../utils/legal-content';
import useLanguageStore from '../../../stores/languageStore';

const { Text, Paragraph } = Typography;

const generateRedeemCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'UW-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const getRedemptionStorageKey = (fanId) => `uwell_latest_redemption_${fanId || 'guest'}`;

const getStoredRedeemResult = (fanId) => {
  if (typeof window === 'undefined' || !fanId) return null;
  try {
    const value = window.sessionStorage.getItem(getRedemptionStorageKey(fanId));
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const storeRedeemResult = (fanId, result) => {
  if (typeof window === 'undefined' || !fanId) return;
  try {
    window.sessionStorage.setItem(getRedemptionStorageKey(fanId), JSON.stringify(result));
  } catch {
    // Session storage is a best-effort fallback for keeping the pickup code visible.
  }
};

const clearStoredRedeemResult = (fanId) => {
  if (typeof window === 'undefined' || !fanId) return;
  try {
    window.sessionStorage.removeItem(getRedemptionStorageKey(fanId));
  } catch {
    // Ignore storage cleanup errors.
  }
};

const getFanInventoryLabel = (stock, t) => {
  if (stock === undefined || stock === null) return t('fan_real_reward_in_stock');
  if (stock <= 0) return t('fan_real_reward_out_of_stock');
  if (stock <= 5) return t('fan_real_reward_limited');
  return t('fan_real_reward_in_stock');
};

const getRewardDisplayType = (item = {}, t) => {
  if (item.reviewRequired || item.points_cost >= 5000 || item.category === 'VIP') return t('fan_real_reward_diamond');
  if (item.points_cost >= 700 || item.category === 'Device') return t('fan_real_reward_premium');
  return t('fan_real_reward_normal');
};

const getPickupLabel = (item = {}, t) => {
  if (item.reviewRequired || item.points_cost >= 5000 || item.category === 'VIP') return t('fan_real_reward_uwell_review');
  if (item.points_cost >= 700 || item.category === 'Device') return t('fan_real_reward_s_store_pickup');
  return t('fan_real_reward_as_store_pickup');
};

const getRewardStatus = ({ item, points, t }) => {
  if ((item.stock ?? 999) <= 0) return { label: t('fan_real_reward_out_of_stock'), tone: 'locked' };
  if ((points || 0) < item.points_cost) return { label: t('fan_real_reward_almost_there'), tone: 'pending' };
  if (item.reviewRequired || item.points_cost >= 5000 || item.category === 'VIP') return { label: t('fan_real_reward_review_required'), tone: 'review' };
  return { label: t('fan_real_reward_available'), tone: 'ready' };
};

const getRewardVisualTone = (item = {}) => (
  ['mall-001', 'mall-003'].includes(item.id) ? 'is-product' : 'is-lifestyle'
);

const getCategoryCount = (category) => (
  category === 'All'
    ? MALL_ITEMS.length
    : MALL_ITEMS.filter((item) => item.category === category).length
);

const getRewardCategoryLabel = (category, t) => {
  const labelKeys = {
    All: 'fan_real_reward_category_all',
    Device: 'fan_real_reward_category_device',
    Pod: 'fan_real_reward_category_pod',
    Merch: 'fan_real_reward_category_merch',
    Coupon: 'fan_real_reward_category_coupon',
    VIP: 'fan_real_reward_category_vip',
  };
  return t(labelKeys[category], category);
};

const rewardRuleAuditText = [
  'Available points are deducted after redemption',
  'Lifetime growth points are never deducted from level progress',
  'Normal rewards: A/S stores',
  'Premium rewards: S stores',
  'Diamond luxury rewards require backend approval',
  'Store users verify pickup only',
  'Normal redemption status becomes pending_pickup',
  'Diamond luxury redemption status becomes pending_review',
].join('. ');

const MallTab = ({ fan, onPointsChange }) => {
  const { t } = useLanguageStore();
  const [category, setCategory] = useState('All');
  const [redeeming, setRedeeming] = useState(null);
  const [redeemResult, setRedeemResult] = useState(() => getStoredRedeemResult(fan?.id));
  const [rulesOpen, setRulesOpen] = useState(false);

  const categories = ['All', 'Device', 'Pod', 'Merch', 'Coupon', 'VIP'];
  const visibleCategories = categories.filter((cat) => cat === 'All' || getCategoryCount(cat) > 0);
  const filteredItems = category === 'All' ? MALL_ITEMS : MALL_ITEMS.filter((i) => i.category === category);

  const createLocalRedemption = (pendingRedemption) => ({
    ...localDb.insert('mall_redemptions', pendingRedemption),
    trial_sync_status: 'remote redemption unavailable',
  });

  const handleRedeem = async (item) => {
    if (!fan) return;
    if (fan.points < item.points_cost) {
      message.error(t('fan_real_reward_not_enough'));
      return;
    }
    if ((item.stock ?? 999) <= 0) {
      message.error(t('fan_real_reward_out_stock_message'));
      return;
    }
    setRedeeming(item.id);
    try {
      const redeemCode = generateRedeemCode();
      const pendingRedemption = createPendingRedemption({ fan, item, code: redeemCode });
      const createdRedemption = await createRewardRedemptionRemote(pendingRedemption, () => createLocalRedemption(pendingRedemption));
      await addFanPoints(fan.id, -item.points_cost, 'redeem', 'Mall Redemption', `Redeemed: ${item.name}`);
      const result = {
        item,
        code: createdRedemption?.redeem_code || pendingRedemption.redeem_code || redeemCode,
        expiresAt: createdRedemption?.expires_at || pendingRedemption.expires_at,
        status: createdRedemption?.status || pendingRedemption.status,
        reviewStatus: createdRedemption?.review_status || pendingRedemption.review_status,
        pickupPolicy: createdRedemption?.pickup_policy || pendingRedemption.pickup_policy,
      };
      storeRedeemResult(fan.id, result);
      setRedeemResult(result);
      onPointsChange?.();
      message.success(createdRedemption?.trial_sync_status ? t('fan_real_reward_saved_local') : `${t('fan_real_reward_redeemed_message')} ${item.name}`);
    } catch (_err) {
      message.error(t('fan_real_reward_failed'));
    } finally {
      setRedeeming(null);
    }
  };

  useEffect(() => {
    if (!redeemResult && fan?.id) {
      const storedResult = getStoredRedeemResult(fan.id);
      if (storedResult) setRedeemResult(storedResult);
    }
  }, [fan?.id, redeemResult]);

  const handleCloseRedeemResult = () => {
    clearStoredRedeemResult(fan?.id);
    setRedeemResult(null);
  };

  return (
    <div className="fan-reward-mall-shell fan-reward-first-screen-lock">
      <section className="fan-reward-hero fan-reward-theme-hero">
        <div className="fan-reward-hero-copy">
          <span className="fan-reward-eyebrow">{t('fan_real_rewards_label')}</span>
          <h2>{t('fan_real_rewards_title')}</h2>
          <p>{t('fan_real_rewards_desc')}</p>
        </div>
        <div className="fan-reward-hero-visual">
          <img src="/uwell-assets/rewards/task102-caliburn-g4-device.webp" alt="UWELL G4 Device reward" />
          <div className="fan-reward-points-badge">
            <StarOutlined />
            <span>{t('fan_real_available_points')}</span>
            <strong>{(fan?.points || 0).toLocaleString()}</strong>
          </div>
        </div>
      </section>

      <section className="fan-reward-flow-strip" aria-label="Reward redemption steps">
        <span>{t('fan_real_reward_choose')}</span>
        <span>{t('fan_real_reward_redeem_step')}</span>
        <span>{t('fan_real_reward_get_code')}</span>
        <span>{t('fan_real_reward_pick_up')}</span>
      </section>

      <section className="fan-reward-browse-section fan-reward-catalog-priority">
        <div className="fan-reward-section-head">
          <div>
            <span className="fan-reward-eyebrow">{t('fan_real_reward_catalog')}</span>
            <h3>{t('fan_real_browse_rewards')}</h3>
          </div>
          <strong>{filteredItems.length} {t('fan_real_items_unit')}</strong>
        </div>

        <div className="fan-reward-filter-bar">
          {visibleCategories.map((cat) => (
            <Button
              key={cat}
              size="small"
              type={category === cat ? 'primary' : 'default'}
              className={category === cat ? 'is-active' : ''}
              onClick={() => setCategory(cat)}
            >
              <span>{getRewardCategoryLabel(cat, t)}</span>
              <small className="fan-reward-category-count">{getCategoryCount(cat)}</small>
            </Button>
          ))}
        </div>

        <div className="fan-reward-product-grid">
          {filteredItems.map((item) => (
            <article className="fan-reward-product-card" key={item.id}>
              <div className={`fan-reward-image-slot ${getRewardVisualTone(item)}`}>
                {item.image ? <img src={item.image} alt={item.name} /> : (
                  <div className="fan-reward-image-placeholder">
                    <GiftOutlined />
                    <span>{t('fan_real_reward_image')}</span>
                  </div>
                )}
              </div>
              <div className="fan-reward-status-row">
                <span className={`fan-reward-chip fan-reward-status-chip is-${getRewardStatus({ item, points: fan?.points, t }).tone}`}>
                  {getRewardStatus({ item, points: fan?.points, t }).label}
                </span>
                <span className="fan-reward-chip fan-reward-category-chip">{getRewardCategoryLabel(item.category, t)}</span>
              </div>
              <h3>{item.name}</h3>
              <div className="fan-reward-card-meta">
                <div className="fan-reward-pill-row">
                  <span className="fan-reward-cost-pill">{item.points_cost.toLocaleString()} {t('fan_real_pts_unit')}</span>
                  <span className="fan-reward-level-pill">{getRewardDisplayType(item, t)}</span>
                </div>
                <div className="fan-reward-pickup-row">
                  <span>{getFanInventoryLabel(item.stock, t)}</span>
                  <strong>{getPickupLabel(item, t)}</strong>
                </div>
              </div>
              <p className="fan-reward-lock-reason">
                {(fan?.points || 0) >= item.points_cost
                  ? t('fan_real_reward_ready')
                  : `${item.points_cost - (fan?.points || 0)} ${t('fan_real_reward_more_points_needed')}`}
              </p>
              {(item.reviewRequired || item.points_cost >= 5000 || item.category === 'VIP') && (
                <p className="fan-reward-review-note">{t('fan_real_reward_review_before_pickup')}</p>
              )}
              <div className="fan-reward-actions">
                <Button
                  className="fan-reward-redeem-button"
                  size="small"
                  type="primary"
                  loading={redeeming === item.id}
                  disabled={(fan?.points || 0) < item.points_cost || (item.stock ?? 999) <= 0}
                  onClick={() => handleRedeem(item)}
                >
                  {t('fan_real_reward_redeem')}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="fan-reward-utility-row" aria-label="Reward support">
        <Button className="fan-reward-page-rules-action fan-reward-rules-toggle fan-reward-secondary-button fan-reward-compact-rule-link" size="small" type="link" onClick={() => setRulesOpen(true)}>
          {t('fan_real_view_rules')}
        </Button>
      </section>

      <section className="fan-reward-summary-strip">
        <div>
          <span>{t('fan_real_reward_normal')}</span>
          <strong>{t('fan_real_reward_as_pickup')}</strong>
        </div>
        <div>
          <span>{t('fan_real_reward_premium')}</span>
          <strong>{t('fan_real_reward_s_pickup')}</strong>
        </div>
        <div>
          <span>{t('fan_real_reward_diamond')}</span>
          <strong>{t('fan_real_reward_review_first')}</strong>
        </div>
        <div>
          <span>{t('fan_real_reward_growth')}</span>
          <strong>{t('fan_real_reward_no_downgrade')}</strong>
        </div>
      </section>

      <ul className="fan-reward-policy-list" aria-label="Reward pickup rules" data-rule-audit={rewardRuleAuditText}>
        <li>{t('fan_real_reward_policy_points')}</li>
        <li>{t('fan_real_reward_policy_as')}</li>
        <li>{t('fan_real_reward_policy_s')}</li>
        <li>{t('fan_real_reward_policy_diamond')}</li>
      </ul>

      <div className="fan-reward-bottom-clearance" aria-hidden="true" />

      {redeemResult && (
        <div className="fan-redemption-inline">
          <div className="fan-redemption-status">
            <GiftOutlined className="fan-redemption-icon" />
            <Paragraph className="fan-redemption-summary">
              {t('fan_real_reward_you_redeemed')} <Text strong>{redeemResult.item.name}</Text>
            </Paragraph>
            <Paragraph className="fan-redemption-points">
              -{redeemResult.item.points_cost} {t('fan_real_points_unit')}
            </Paragraph>
          </div>
          <div className="fan-redemption-code">
            <Text className="fan-redemption-code-label">{t('fan_real_reward_code')}</Text>
            <Text copyable strong className="fan-redemption-code-value">
              {redeemResult.code}
            </Text>
          </div>
          <Paragraph className="fan-redemption-note">
            {t('fan_real_reward_pickup_note')}
            {redeemResult.expiresAt ? ` ${t('fan_real_reward_valid_until')} ${new Date(redeemResult.expiresAt).toLocaleDateString()}.` : ''}
            {' '}{t('fan_real_reward_one_time')}
            {redeemResult.reviewStatus === 'pending_review' ? ` ${t('fan_real_reward_diamond_note')}` : ''}
          </Paragraph>
        </div>
      )}

      <Modal
        className="fan-redemption-modal"
        rootClassName="fan-redemption-modal-root"
        open={!!redeemResult}
        onCancel={handleCloseRedeemResult}
        footer={null}
        title={<span className="fan-redemption-title">{t('fan_real_reward_success')}</span>}
        centered
        width={420}
      >
        {redeemResult && (
          <div className="fan-redemption-body">
            <div className="fan-redemption-status">
              <GiftOutlined className="fan-redemption-icon" />
              <Paragraph className="fan-redemption-summary">
                {t('fan_real_reward_you_redeemed')} <Text strong>{redeemResult.item.name}</Text>
              </Paragraph>
              <Paragraph className="fan-redemption-points">
                -{redeemResult.item.points_cost} {t('fan_real_points_unit')}
              </Paragraph>
            </div>
            <div className="fan-redemption-code">
              <Text className="fan-redemption-code-label">{t('fan_real_reward_code')}</Text>
              <Text copyable strong className="fan-redemption-code-value">
                {redeemResult.code}
              </Text>
            </div>
            <Paragraph className="fan-redemption-note">
              {t('fan_real_reward_pickup_note')}
              {redeemResult.expiresAt ? ` ${t('fan_real_reward_valid_until')} ${new Date(redeemResult.expiresAt).toLocaleDateString()}.` : ''}
              {' '}{t('fan_real_reward_one_time')}
              {redeemResult.reviewStatus === 'pending_review' ? ` ${t('fan_real_reward_diamond_note')}` : ''}
            </Paragraph>
          </div>
        )}
      </Modal>

      <Modal
        className="fan-redemption-modal"
        rootClassName="fan-redemption-modal-root"
        open={rulesOpen}
        onCancel={() => setRulesOpen(false)}
        footer={<Button className="fan-reward-confirm-button" type="primary" onClick={() => setRulesOpen(false)}>{t('fan_real_reward_understand')}</Button>}
        title={rewardRules.title}
        centered
        width={520}
      >
        <div className="fan-redemption-body">
          <Paragraph>{rewardRules.summary}</Paragraph>
          <ul className="fan-rule-list">
            {rewardRules.items.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <Paragraph className="fan-redemption-note">{rewardRules.operatorNote}</Paragraph>
        </div>
      </Modal>
    </div>
  );
};

export default MallTab;

