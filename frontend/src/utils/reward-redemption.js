export const REDEMPTION_STATUS = {
  PENDING_PICKUP: 'pending_pickup',
  PICKED_UP: 'picked_up',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

const PICKUP_WINDOW_DAYS = 7;

export function createPendingRedemption({ fan, item, code, now = new Date() }) {
  const expiresAt = new Date(now.getTime() + PICKUP_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  return {
    fan_id: fan.id,
    item_id: item.id,
    item_name: item.name,
    points_cost: item.points_cost,
    redeem_code: code,
    status: REDEMPTION_STATUS.PENDING_PICKUP,
    expires_at: expiresAt.toISOString(),
  };
}

export function validateRewardPickup({ redemption, store, inventoryItem, now = new Date() }) {
  if (!redemption) return { valid: false, message: 'Code not found' };
  if (redemption.status === REDEMPTION_STATUS.PICKED_UP) return { valid: false, message: 'Code already used' };
  if (redemption.status !== REDEMPTION_STATUS.PENDING_PICKUP) return { valid: false, message: 'Code is not available for pickup' };
  if (redemption.expires_at && new Date(redemption.expires_at).getTime() < now.getTime()) {
    return { valid: false, message: 'Code expired' };
  }
  if (store?.level !== 'S') {
    return { valid: false, message: 'Only S-level UWELL stores can fulfill rewards' };
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

    return updated;
  });
}
