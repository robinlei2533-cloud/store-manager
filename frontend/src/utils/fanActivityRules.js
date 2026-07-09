export const TIMED_TASK_SECONDS = 10;

export function buildStoreActivityCampaign({
  store,
  title,
  description,
  gift = '',
  startDate,
  endDate,
  points = 0,
}) {
  const now = new Date().toISOString();
  return {
    id: `store-campaign-${Date.now()}`,
    name: title,
    name_english: title,
    description,
    description_english: description,
    type: 'store_event',
    source: 'store_application',
    submitted_by_store_id: store.id,
    submitted_by_store_name: store.name,
    store_name: store.name,
    country: store.country || '',
    city: store.city || '',
    gift,
    fan_points: Number(points || 0),
    target_stores: [store.id],
    start_date: startDate,
    end_date: endDate,
    status: 'planned',
    approval_status: 'pending',
    fan_visible: false,
    created_at: now,
    updated_at: now,
  };
}

export function filterFanVisibleStoreActivities(campaigns = [], fan = {}) {
  return campaigns
    .filter((campaign) => (
      campaign.source === 'store_application'
      && campaign.approval_status === 'approved'
      && campaign.fan_visible === true
      && ['ongoing', 'planned'].includes(campaign.status)
    ))
    .filter((campaign) => {
      if (!fan?.city || !campaign.city) return true;
      return campaign.city === fan.city;
    })
    .sort((a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0));
}

function sameLocalDay(left, right) {
  return new Date(left).toDateString() === new Date(right).toDateString();
}

export function canClaimTimedTask(records = [], fanId, taskKey, now = new Date(), elapsedSeconds = TIMED_TASK_SECONDS) {
  if (!fanId || !taskKey) return { canClaim: false, reason: 'missing_fan_or_task' };
  if (elapsedSeconds < TIMED_TASK_SECONDS) return { canClaim: false, reason: 'need_more_time' };
  const alreadyClaimed = records.some((record) => (
    record.fan_id === fanId
    && record.task_key === taskKey
    && record.completed_at
    && sameLocalDay(record.completed_at, now)
  ));
  if (alreadyClaimed) return { canClaim: false, reason: 'already_claimed_today' };
  return { canClaim: true, reason: 'ready' };
}

export function buildRewardTierRules() {
  return [
    {
      key: 'starter',
      label: 'Starter gifts',
      examples: ['Sticker pack', 'Lanyard', 'Lucky draw ticket'],
      minPoints: 50,
      maxPoints: 100,
      pickupStoreLevel: 'S',
    },
    {
      key: 'standard',
      label: 'Standard merchandise',
      examples: ['UWELL cap', 'T-shirt', 'Lighter'],
      minPoints: 150,
      maxPoints: 300,
      pickupStoreLevel: 'S',
    },
    {
      key: 'value',
      label: 'Pods, accessories, and coupons',
      examples: ['Pod pack', 'Accessory kit', '20-50 SAR store coupon'],
      minPoints: 300,
      maxPoints: 600,
      pickupStoreLevel: 'S',
    },
    {
      key: 'premium',
      label: 'Devices and VIP rewards',
      examples: ['UWELL device', 'VIP gift box', 'Limited reward'],
      minPoints: 800,
      maxPoints: 1500,
      pickupStoreLevel: 'S',
      monthlyLimit: 1,
    },
  ];
}
