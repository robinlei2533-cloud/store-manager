const FAN_LEVEL_ORDER = ['Bronze', 'Silver', 'Gold', 'Diamond'];

export const OPERATIONAL_RULE_RECORD_ID = 'trial-operational-rules';

export const DEFAULT_OPERATIONAL_RULES = {
  scanPoints: 5,
  dailyScanLimit: 3,
  checkInPoints: 5,
  communityLikePoints: 1,
  communityLikeDailyLimit: 10,
  communityCommentPoints: 2,
  communityCommentDailyLimit: 5,
  communityPostPoints: 10,
  communityPostDailyLimit: 1,
  highValueRewardReviewThreshold: 3000,
  storeEventMinPoints: 20,
  storeEventMaxPoints: 100,
  materialLowStockThreshold: 20,
};

export function mergeOperationalRules(settings = {}) {
  return {
    ...DEFAULT_OPERATIONAL_RULES,
    ...(settings || {}),
  };
}

export const FAN_LEVEL_THRESHOLDS = [
  { level: 'Bronze', threshold: 0 },
  { level: 'Silver', threshold: 300 },
  { level: 'Gold', threshold: 1000 },
  { level: 'Diamond', threshold: 5000 },
];

export const POINT_EARNING_CHANNELS = [
  { key: 'scan', label: 'Scan', points: '+5', limit: '3 counted product scans / day', desc: 'Only unique UWELL product codes earn product scan points.' },
  { key: 'checkin', label: 'Check in', points: '+5', limit: '1 / day', desc: 'Daily base growth action.' },
  { key: 'activities', label: 'Activities', points: '+20 to +100', limit: 'Campaign rule', desc: 'Store events require store verification before points are awarded.' },
  { key: 'community', label: 'Community', points: '+1 / +2 / +10', limit: 'Likes 10, comments 5, first post', desc: 'Valid likes, comments, and first daily post count.' },
];

export const SCAN_VALIDATION_CONTRACT = {
  mode: 'server_required_for_points',
  localRecognitionMode: 'trial_preview_only',
  codeTypes: [
    'product_unique',
    'store_event',
    'official_activity',
    'fan_center_entry',
    'official_site',
    'social_community',
    'not_uwell',
  ],
  requiredProductCodeFields: [
    'code_id',
    'code_type',
    'code_signature',
    'batch_no',
    'product_sku',
    'product_name',
    'status',
    'claimed_by',
    'claimed_at',
    'scan_count',
    'valid_from',
    'valid_until',
    'reward_points',
    'validator_source',
    'decision_reason',
  ],
  decisionStatuses: [
    'unused',
    'claimed',
    'suspicious',
    'blocked',
    'expired',
    'unverified_preview_only',
    'daily_limit',
    'recognized_no_points',
    'not_uwell',
  ],
  validatorSources: [
    'uwell_code_service',
    'admin_generated_trial_batch',
    'campaign_rule_engine',
    'local_preview_recognition',
  ],
  fixedRules: [
    'Product unique codes require server validation before points are awarded.',
    'Local pattern recognition can identify possible UWELL codes in preview, but cannot grant production points.',
    'First valid product claim earns points; later scans of the same code do not.',
    'Another fan scanning an already-claimed product code becomes suspicious.',
    'Daily product scan point limit applies after code validity is confirmed.',
  ],
};

export function getScanValidationContract() {
  return SCAN_VALIDATION_CONTRACT;
}

export const ACTIVITY_VERIFICATION_STEPS = [
  'Fan joins activity',
  'Fan visits store',
  'Store scans fan QR',
  'Store confirms participation',
  'System validates rules',
  'Points added or sent to review',
];

export const REWARD_CATALOG = [
  { id: 'lanyard', name: 'UWELL lanyard', requiredPoints: 100, requiredLevel: 'Bronze', type: 'Normal', reviewRequired: false, pickupRule: 'A/S stores', imageTone: 'Merch' },
  { id: 'single-pod', name: 'Single pod', requiredPoints: 150, requiredLevel: 'Bronze', type: 'Normal', reviewRequired: false, pickupRule: 'A/S stores, compliance check', imageTone: 'Pod' },
  { id: 'stickers', name: 'Stickers / small merchandise', requiredPoints: 200, requiredLevel: 'Bronze', type: 'Normal', reviewRequired: false, pickupRule: 'A/S stores', imageTone: 'Merch' },
  { id: 'cap', name: 'UWELL cap', requiredPoints: 300, requiredLevel: 'Silver', type: 'Normal', reviewRequired: false, pickupRule: 'A/S stores', imageTone: 'Merch' },
  { id: 'tshirt', name: 'UWELL T-shirt', requiredPoints: 350, requiredLevel: 'Silver', type: 'Normal', reviewRequired: false, pickupRule: 'A/S stores', imageTone: 'Merch' },
  { id: 'waist-bag', name: 'Waist bag', requiredPoints: 400, requiredLevel: 'Silver', type: 'Normal', reviewRequired: false, pickupRule: 'A/S stores', imageTone: 'Merch' },
  { id: 'ukuuku-doll', name: 'UKUUKU IP doll', requiredPoints: 600, requiredLevel: 'Silver', type: 'Normal', reviewRequired: false, pickupRule: 'A/S stores', imageTone: 'IP' },
  { id: 'multi-pod', name: 'Multi-pod pack', requiredPoints: 900, requiredLevel: 'Gold', type: 'Premium', reviewRequired: false, pickupRule: 'S stores, compliance check', imageTone: 'Pod' },
  { id: 'limited-set', name: 'Limited merchandise set', requiredPoints: 1200, requiredLevel: 'Gold', type: 'Premium', reviewRequired: false, pickupRule: 'S stores', imageTone: 'Set' },
  { id: 'gift-box', name: 'UWELL gift box', requiredPoints: 2500, requiredLevel: 'Gold', type: 'Premium', reviewRequired: true, pickupRule: 'S stores or assigned pickup', imageTone: 'Gift' },
  { id: 'sample-device', name: 'Sample / trial device', requiredPoints: 3500, requiredLevel: 'Gold', type: 'Premium', reviewRequired: true, pickupRule: 'Backend review', imageTone: 'Device' },
  { id: 'product-bundle', name: 'Product bundle', requiredPoints: 5000, requiredLevel: 'Diamond', type: 'Diamond', reviewRequired: true, pickupRule: 'Backend review', imageTone: 'Bundle' },
  { id: 'sample-big-bundle', name: 'Sample big bundle', requiredPoints: 7000, requiredLevel: 'Diamond', type: 'Diamond', reviewRequired: true, pickupRule: 'Backend review', imageTone: 'Bundle' },
  { id: 'collector-set', name: 'UWELL full material / collector set', requiredPoints: 8000, requiredLevel: 'Diamond', type: 'Diamond', reviewRequired: true, pickupRule: 'Backend review', imageTone: 'Collector' },
  { id: 'headphones', name: 'Premium headphones', requiredPoints: 10000, requiredLevel: 'Diamond', type: 'Diamond', reviewRequired: true, pickupRule: 'Backend review', imageTone: 'Digital' },
  { id: 'china-trip', name: 'One-week China trip', requiredPoints: 15000, requiredLevel: 'Diamond', type: 'Diamond', reviewRequired: true, pickupRule: 'Backend review, limited slots', imageTone: 'Trip' },
  { id: 'phone', name: 'Phone or high-value electronics', requiredPoints: 20000, requiredLevel: 'Diamond', type: 'Diamond', reviewRequired: true, pickupRule: 'Backend review', imageTone: 'Digital' },
];

export const STORE_EXPOSURE_LEVELS = [
  { level: 'S', fanLabel: 'UWELL Brand Store', exposure: 'Home priority, map highlight, Store Events priority, premium pickup' },
  { level: 'A', fanLabel: 'Recommended', exposure: 'Higher map placement, Home eligibility, normal reward pickup' },
  { level: 'B', fanLabel: 'Listed', exposure: 'Normal map listing and selected campaigns' },
  { level: 'C', fanLabel: 'Listed', exposure: 'Basic partner listing' },
];

export function isActiveSStoreForFans(store = {}) {
  const status = store.s_store_status || 'active';
  return Boolean((store.is_s_store || store.level === 'S') && status === 'active');
}

export function getFanFacingStorePresentation(store = {}) {
  if (isActiveSStoreForFans(store)) {
    return {
      fanLabel: 'UWELL Brand Store',
      trustCopy: 'Official UWELL brand experience and premium reward pickup readiness.',
      pickupLabel: 'Premium pickup ready',
      markerLabel: 'Brand',
    };
  }
  if (store.level === 'A') {
    return {
      fanLabel: 'Recommended UWELL partner',
      trustCopy: 'Reviewed UWELL partner with reward pickup readiness.',
      pickupLabel: 'Pickup eligible',
      markerLabel: 'Recommended',
    };
  }
  return {
    fanLabel: 'UWELL partner store',
    trustCopy: 'Visible UWELL partner for store visits and product support.',
    pickupLabel: 'Partner store',
    markerLabel: 'Listed',
  };
}

export function getStoreExposureScore(store) {
  const exposure_controls = store?.exposure_controls || {};
  if (exposure_controls.hidden_from_fan_app) return Number.NEGATIVE_INFINITY;

  const levelScore = { S: 60, A: 45, B: 25, C: 10 }[store?.level] || 0;
  const brandStoreBoost = isActiveSStoreForFans(store) ? 12 : 0;
  const homeBoost = exposure_controls.fan_home_recommended ? 35 : 0;
  const mapBoost = exposure_controls.fan_map_highlighted ? 25 : 0;
  const eventBoost = exposure_controls.store_events_visible || exposure_controls.eligible_for_store_events_display ? 15 : 0;
  const pickupBoost = exposure_controls.reward_pickup_recommended ? 10 : 0;
  const weightBoost = Number(exposure_controls.exposure_weight || 0);
  const riskPenalty = exposure_controls.risk_downrank ? -80 : 0;

  return levelScore + brandStoreBoost + homeBoost + mapBoost + eventBoost + pickupBoost + weightBoost + riskPenalty;
}

export function sortStoresForFanExposure(stores = []) {
  return stores
    .filter((store) => store?.lat && store?.lng)
    .filter((store) => getStoreExposureScore(store) > Number.NEGATIVE_INFINITY)
    .sort((a, b) => getStoreExposureScore(b) - getStoreExposureScore(a));
}

export const REGIONAL_WAREHOUSES = [
  { region: 'Riyadh', warehouse: 'Riyadh Warehouse' },
  { region: 'Dammam', warehouse: 'Dammam Warehouse' },
  { region: 'Jeddah', warehouse: 'Jeddah Warehouse' },
];

export const REVIEW_TYPES = [
  'Store-created campaigns',
  'High-value rewards',
  'Store level changes',
  'Field visit ratings',
  'Suspicious scans',
  'Store front photos',
  'Display photos',
  'Material requests',
  'Community reports',
];

export const RISK_RULES = [
  'Invalid scan attempts over 10/day',
  'Same store verifications over 30/hour',
  'Manual verification ratio over 50%',
  'Same fan same activity duplicate attempt',
  'Duplicate comments over 5/day',
  'High-value reward request',
  'New account earns over 100 points on first day',
];

export function isValidBusinessEmail(email) {
  if (typeof email !== 'string') return false;
  const value = email.trim();
  if (!value || value.length > 254) return false;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,24}$/;
  if (!emailPattern.test(value)) return false;
  const [, domain = ''] = value.split('@');
  const [root = '', ...suffixParts] = domain.split('.');
  const suffix = suffixParts.join('.');
  const fakeDomainRoots = new Set(['test', 'example', 'invalid', 'localhost']);
  return root.length >= 2
    && suffix.length >= 2
    && !domain.endsWith('.')
    && !/^\d+$/.test(root)
    && !fakeDomainRoots.has(root.toLowerCase());
}

export function getFanLevel(lifetimeGrowthPoints = 0) {
  const points = Number(lifetimeGrowthPoints) || 0;
  return FAN_LEVEL_THRESHOLDS.reduce((current, levelInfo) => (
    points >= levelInfo.threshold ? levelInfo : current
  ), FAN_LEVEL_THRESHOLDS[0]);
}

export function getNextFanLevel(lifetimeGrowthPoints = 0) {
  const points = Number(lifetimeGrowthPoints) || 0;
  return FAN_LEVEL_THRESHOLDS.find((levelInfo) => points < levelInfo.threshold) || null;
}

export function classifyScanResult({
  codeType,
  alreadyClaimed = false,
  claimedByCurrentFan = false,
  scansToday = 0,
  hasServerValidation = true,
  ruleSettings = DEFAULT_OPERATIONAL_RULES,
} = {}) {
  const rules = mergeOperationalRules(ruleSettings);
  if (codeType === 'product_unique') {
    if (!hasServerValidation) {
      return {
        status: 'unverified_preview_only',
        points: 0,
        message: 'Possible UWELL product code recognized. Points require official UWELL code validation.',
        validatorSource: 'local_preview_recognition',
        decisionReason: 'Product unique codes must be verified by the UWELL code service before earning points.',
      };
    }
    if (alreadyClaimed && !claimedByCurrentFan) {
      return {
        status: 'suspicious',
        points: 0,
        message: 'This UWELL code has already been claimed by another fan.',
        validatorSource: 'uwell_code_service',
        decisionReason: 'Claimed by a different fan.',
      };
    }
    if (alreadyClaimed) {
      return {
        status: 'already_claimed',
        points: 0,
        message: 'You already claimed this code.',
        validatorSource: 'uwell_code_service',
        decisionReason: 'Duplicate claim by same fan.',
      };
    }
    if (scansToday >= rules.dailyScanLimit) {
      return {
        status: 'daily_limit',
        points: 0,
        message: 'Daily scan point limit reached. Code recognized, no points added.',
        validatorSource: 'uwell_code_service',
        decisionReason: 'Fan reached daily counted product scan limit.',
      };
    }
    return {
      status: 'points_awarded',
      points: rules.scanPoints,
      message: `Valid UWELL product code. +${rules.scanPoints} points.`,
      validatorSource: 'uwell_code_service',
      decisionReason: 'Unique product code validated and unused.',
    };
  }

  if (['store_event', 'official_activity'].includes(codeType)) {
    return {
      status: 'requires_verification',
      points: 0,
      message: 'Activity code recognized. Verification may be required.',
      validatorSource: 'campaign_rule_engine',
      decisionReason: 'Activity points depend on campaign and verification rules.',
    };
  }

  if (['fan_center_entry', 'official_site', 'social_community'].includes(codeType)) {
    return {
      status: 'recognized_no_points',
      points: 0,
      message: 'UWELL code recognized. No product scan points added.',
      validatorSource: 'campaign_rule_engine',
      decisionReason: 'Recognized UWELL entry or content code without product scan points.',
    };
  }

  return {
    status: 'not_uwell',
    points: 0,
    message: 'This code is not eligible for UWELL points.',
    validatorSource: 'local_preview_recognition',
    decisionReason: 'Code is not recognized as an eligible UWELL code.',
  };
}

function getSalesScore(monthlySalesUnits = 0) {
  const units = Number(monthlySalesUnits) || 0;
  if (units >= 4) return 20;
  if (units >= 3) return 15;
  if (units >= 2) return 10;
  if (units >= 1) return 5;
  return 0;
}

function clampScore(value, max) {
  const score = Number(value) || 0;
  return Math.max(0, Math.min(score, max));
}

export function scoreStoreRating(input = {}) {
  const salesScore = getSalesScore(input.monthlySalesUnits);
  const total = salesScore
    + clampScore(input.locationTraffic, 15)
    + clampScore(input.storefront, 10)
    + clampScore(input.displayQuality, 15)
    + clampScore(input.productCoverage, 15)
    + clampScore(input.staffCooperation, 10)
    + clampScore(input.campaignReadiness, 10)
    + clampScore(input.dataCompleteness, 5);

  let suggestedLevel = 'C';
  if (total >= 90) suggestedLevel = 'S';
  else if (total >= 75) suggestedLevel = 'A';
  else if (total >= 60) suggestedLevel = 'B';

  return { salesScore, total, suggestedLevel };
}

export function canRoleCreateStaff(role) {
  return role === 'admin';
}

export function canViewWarehouse(role, assignedRegion, warehouseRegion) {
  if (role === 'admin') return true;
  return Boolean(assignedRegion && warehouseRegion && assignedRegion === warehouseRegion);
}

export function getRewardDecision(fan = {}, reward = {}) {
  const availablePoints = Number(fan.availablePoints) || 0;
  const lifetimeGrowthPoints = Number(fan.lifetimeGrowthPoints) || 0;
  const requiredPoints = Number(reward.requiredPoints) || 0;
  const requiredLevel = reward.requiredLevel || 'Bronze';
  const currentLevel = getFanLevel(lifetimeGrowthPoints).level;
  const currentLevelIndex = FAN_LEVEL_ORDER.indexOf(currentLevel);
  const requiredLevelIndex = FAN_LEVEL_ORDER.indexOf(requiredLevel);

  if (requiredLevelIndex > currentLevelIndex) {
    return { status: 'level_locked', reason: `Requires ${requiredLevel}` };
  }
  if (availablePoints < requiredPoints) {
    return { status: 'not_enough_points', reason: `${requiredPoints - availablePoints} more points needed` };
  }
  if (reward.reviewRequired) {
    return { status: 'requires_review', reason: 'Backend approval required before pickup.' };
  }
  return { status: 'redeemable', reason: 'Ready to redeem.' };
}

function resolveCampaignPoints(campaign = {}, rules = DEFAULT_OPERATIONAL_RULES) {
  const rawPoints = campaign.reward_points
    ?? campaign.points
    ?? campaign.requested_points_support
    ?? campaign.operational_rule_snapshot?.storeEventMinPoints
    ?? rules.storeEventMinPoints;
  return Math.max(0, Number(rawPoints) || 0);
}

export function resolveStoreActivityVerification({
  code = '',
  fan = null,
  campaign = {},
  isDuplicate = false,
  ruleSettings = DEFAULT_OPERATIONAL_RULES,
} = {}) {
  const rules = mergeOperationalRules(ruleSettings);
  if (isDuplicate) {
    return {
      status: 'duplicate',
      verificationState: 'duplicate',
      pointsAwardStatus: 'not_awarded_duplicate',
      points: 0,
      requiresBackendReview: true,
      reason: 'Same fan cannot earn duplicate points from the same store activity.',
    };
  }

  if (!fan?.id) {
    return {
      status: 'pending_review',
      verificationState: 'pending_review',
      pointsAwardStatus: 'pending_review_unmatched_fan',
      points: 0,
      requiresBackendReview: true,
      reason: `Fan identity could not be matched from ${code || 'empty code'}.`,
    };
  }

  const points = resolveCampaignPoints(campaign, rules);
  if (points >= rules.highValueRewardReviewThreshold) {
    return {
      status: 'pending_review',
      verificationState: 'pending_review',
      pointsAwardStatus: 'pending_review_high_value',
      points,
      requiresBackendReview: true,
      reason: 'High-value activity reward requires backend review before points are added.',
    };
  }

  return {
    status: 'points_added',
    verificationState: 'points_added',
    pointsAwardStatus: 'system_awarded',
    points,
    requiresBackendReview: false,
    reason: 'System validated the store activity and awarded points according to UWELL rules.',
  };
}
