import supabase from '../supabase';
import { withFallback } from './helpers';

export async function createRewardRedemptionRemote(redemption, localCreate) {
  return withFallback(
    async () => {
      const row = {
        ...redemption,
        product_name: redemption.item_name,
        points_spent: redemption.points_cost,
        quantity: redemption.quantity || 1,
      };
      const { data, error } = await supabase
        .from('mall_redemptions')
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async () => localCreate()
  );
}

export async function confirmRewardPickupRemote(redeemCode, localConfirm) {
  const normalizedCode = String(redeemCode || '').trim().toUpperCase();
  return withFallback(
    async () => {
      const { data, error } = await supabase.rpc('confirm_reward_pickup', {
        p_redeem_code: normalizedCode,
      });
      if (error) throw error;
      return data;
    },
    async () => localConfirm()
  );
}
