import supabase from '../supabase';
import { withFallback } from './helpers';

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
