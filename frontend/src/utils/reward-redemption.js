export const REDEMPTION_STATUS = {
  PENDING_PICKUP: 'pending_pickup',
  PICKED_UP: 'picked_up',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

const PICKUP_WINDOW_DAYS = 7;

function getRewardType(item = {}) {
  if (item.type) return item.type;
  if (item.reviewRequired || item.points_cost >= 5000 || item.category === 'VIP') return 'Diamond';
  if (item.points_cost >= 700 || item.category === 'Device') return 'Premium';
  return 'Normal';
}

function getPickupPolicy(rewardType) {
  if (rewardType === 'Diamond') return 'backend_review_assigned_pickup';
  if (rewardType === 'Premium') return 'premium_s_store';
  return 'normal_a_s_store';
}

function canStoreFulfillPolicy(policy, store) {
  if (policy === 'normal_a_s_store') return ['A', 'S'].includes(store?.level);
  if (policy === 'premium_s_store') return store?.level === 'S';
  if (policy === 'backend_review_assigned_pickup') return store?.level === 'S';
  return false;
}

export function createPendingRedemption({ fan, item, code, now = new Date() }) {
  const expiresAt = new Date(now.getTime() + PICKUP_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const rewardType = getRewardType(item);
  const reviewRequired = Boolean(item.reviewRequired || rewardType === 'Diamond');
  return {
    fan_id: fan.id,
    item_id: item.id,
    item_name: item.name,
    points_cost: item.points_cost,
    reward_type: rewardType,
    pickup_policy: getPickupPolicy(rewardType),
    review_required: reviewRequired,
    review_status: reviewRequired ? 'pending_review' : 'not_required',
    redeem_code: code,
    status: reviewRequired ? 'pending_review' : REDEMPTION_STATUS.PENDING_PICKUP,
    expires_at: expiresAt.toISOString(),
  };
}

export function validateRewardPickup({ redemption, store, inventoryItem, now = new Date() }) {
  if (!redemption) return { valid: false, message: 'Code not found' };
  if (redemption.status === REDEMPTION_STATUS.PICKED_UP) return { valid: false, message: 'Code already used' };
  if (redemption.review_required && redemption.review_status !== 'approved') {
    return { valid: false, message: 'Diamond luxury rewards require backend approval before pickup' };
  }
  if (![REDEMPTION_STATUS.PENDING_PICKUP, 'pending_review'].includes(redemption.status)) return { valid: false, message: 'Code is not available for pickup' };
  if (redemption.expires_at && new Date(redemption.expires_at).getTime() < now.getTime()) {
    return { valid: false, message: 'Code expired' };
  }
  const policy = redemption.pickup_policy || getPickupPolicy(redemption.reward_type);
  if (!canStoreFulfillPolicy(policy, store)) {
    if (policy === 'normal_a_s_store') return { valid: false, message: 'Normal rewards can only be fulfilled by A or S stores' };
    if (policy === 'premium_s_store') return { valid: false, message: 'Premium rewards can only be fulfilled by S-level UWELL stores' };
    return { valid: false, message: 'Diamond luxury rewards require backend approval before pickup' };
  }
  if (!inventoryItem || Number(inventoryItem.quantity_on_hand || 0) <= 0) {
    return { valid: false, message: 'Reward stock is not enough. Request replenishment.' };
  }
  return { valid: true, message: 'Ready for pickup' };
}

export function confirmRewardPickup({ localDb, redemption, store, inventoryItem, pickedUpBy, now = new Date() }) {
  const validation = validateRewardPickup({ redemption, store, inventoryItem, now });
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  return localDb.transaction((tx) => {
    const pickedUpAt = now.toISOString();
    const updated = tx.update('mall_redemptions', redemption.id, {
      status: REDEMPTION_STATUS.PICKED_UP,
      pickup_store_id: store.id,
      picked_up_at: pickedUpAt,
      picked_up_by: pickedUpBy,
    });

    tx.update('material_stocks', inventoryItem.id, {
      quantity_on_hand: Number(inventoryItem.quantity_on_hand || 0) - 1,
    });

    tx.insert('material_outbound', {
      store_id: store.id,
      item_id: redemption.item_id,
      material_id: inventoryItem.material_id || inventoryItem.item_id || redemption.item_id,
      material_name: redemption.item_name,
      movement_type: 'reward_redemption',
      quantity: -1,
      redemption_id: redemption.id,
      redeem_code: redemption.redeem_code,
      created_by: pickedUpBy,
      outbound_date: pickedUpAt,
      status: 'delivered',
    });

    tx.insert('audit_logs', {
      action_type: 'Reward pickup confirmed',
      actor_id: pickedUpBy,
      actor_role: 'store_owner',
      target_type: 'mall_redemption',
      target_id: redemption.id,
      before_value: JSON.stringify({ status: redemption.status }),
      after_value: JSON.stringify({ status: REDEMPTION_STATUS.PICKED_UP, pickup_store_id: store.id }),
      reason: 'Store users verify pickup only. System applies fixed redemption logic.',
      created_at: pickedUpAt,
    });

    return updated;
  });
}
