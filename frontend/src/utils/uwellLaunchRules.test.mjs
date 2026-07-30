import { describe, expect, test } from 'vitest';
import {
  canRoleCreateStaff,
  canViewWarehouse,
  classifyScanResult,
  getScanValidationContract,
  getFanLevel,
  getNextFanLevel,
  getRewardDecision,
  getFanFacingStorePresentation,
  isValidBusinessEmail,
  isActiveSStoreForFans,
  mergeOperationalRules,
  resolveStoreActivityVerification,
  scoreStoreRating,
} from './uwellLaunchRules.js';

describe('uwell launch rules', () => {
  test('validates real-looking email suffixes', () => {
    expect(isValidBusinessEmail('store.owner@uwell.sa')).toBe(true);
    expect(isValidBusinessEmail('manager@partner.com')).toBe(true);
    expect(isValidBusinessEmail('123@123')).toBe(false);
    expect(isValidBusinessEmail('123@123.')).toBe(false);
    expect(isValidBusinessEmail('123@123.com')).toBe(false);
    expect(isValidBusinessEmail('fan@test.com')).toBe(false);
    expect(isValidBusinessEmail('bad-email')).toBe(false);
  });

  test('keeps fan level based on lifetime growth points', () => {
    expect(getFanLevel(0).level).toBe('Bronze');
    expect(getFanLevel(300).level).toBe('Silver');
    expect(getFanLevel(1000).level).toBe('Gold');
    expect(getFanLevel(5000).level).toBe('Diamond');
    expect(getNextFanLevel(1200).level).toBe('Diamond');
  });

  test('classifies UWELL unique code scan outcomes', () => {
    expect(classifyScanResult({ codeType: 'product_unique', alreadyClaimed: false, scansToday: 2 }).status).toBe('points_awarded');
    expect(classifyScanResult({ codeType: 'product_unique', alreadyClaimed: false, scansToday: 3 }).status).toBe('daily_limit');
    expect(classifyScanResult({ codeType: 'product_unique', alreadyClaimed: true, claimedByCurrentFan: false }).status).toBe('suspicious');
    expect(classifyScanResult({ codeType: 'official_site' }).status).toBe('recognized_no_points');
    expect(classifyScanResult({ codeType: 'unknown' }).status).toBe('not_uwell');
  });

  test('defines production scan validation boundary for unique UWELL product codes', () => {
    const contract = getScanValidationContract();
    expect(contract.mode).toBe('server_required_for_points');
    expect(contract.localRecognitionMode).toBe('trial_preview_only');
    expect(contract.codeTypes).toContain('product_unique');
    expect(contract.requiredProductCodeFields).toEqual(expect.arrayContaining([
      'code_id',
      'code_type',
      'code_signature',
      'batch_no',
      'product_sku',
      'status',
      'validator_source',
      'decision_reason',
    ]));
    expect(contract.decisionStatuses).toEqual(expect.arrayContaining([
      'unused',
      'claimed',
      'suspicious',
      'blocked',
      'expired',
      'unverified_preview_only',
    ]));
    expect(classifyScanResult({
      codeType: 'product_unique',
      hasServerValidation: false,
      scansToday: 0,
    }).status).toBe('unverified_preview_only');
  });

  test('uses editable operational scan points and daily limit', () => {
    const rules = mergeOperationalRules({ scanPoints: 6, dailyScanLimit: 5 });
    expect(classifyScanResult({ codeType: 'product_unique', scansToday: 4, ruleSettings: rules }).points).toBe(6);
    expect(classifyScanResult({ codeType: 'product_unique', scansToday: 5, ruleSettings: rules }).status).toBe('daily_limit');
  });

  test('keeps community post daily limit in operational rules', () => {
    const rules = mergeOperationalRules({ communityPostPoints: 12, communityPostDailyLimit: 2 });
    expect(rules.communityPostPoints).toBe(12);
    expect(rules.communityPostDailyLimit).toBe(2);
  });

  test('scores stores with monthly sales as 20 percent of rating', () => {
    const result = scoreStoreRating({
      monthlySalesUnits: 5,
      locationTraffic: 15,
      storefront: 10,
      displayQuality: 15,
      productCoverage: 15,
      staffCooperation: 10,
      campaignReadiness: 10,
      dataCompleteness: 5,
    });

    expect(result.salesScore).toBe(20);
    expect(result.total).toBe(100);
    expect(result.suggestedLevel).toBe('S');
  });

  test('enforces backend account and regional warehouse permissions', () => {
    expect(canRoleCreateStaff('admin')).toBe(true);
    expect(canRoleCreateStaff('manager')).toBe(false);
    expect(canRoleCreateStaff('rep')).toBe(false);
    expect(canViewWarehouse('admin', 'Riyadh', 'Jeddah')).toBe(true);
    expect(canViewWarehouse('manager', 'Riyadh', 'Riyadh')).toBe(true);
    expect(canViewWarehouse('rep', 'Riyadh', 'Dammam')).toBe(false);
  });

  test('locks rewards by available points, lifetime level, and review rules', () => {
    const fan = { availablePoints: 5200, lifetimeGrowthPoints: 5000 };
    expect(getRewardDecision(fan, { requiredPoints: 400, requiredLevel: 'Silver', reviewRequired: false }).status).toBe('redeemable');
    expect(getRewardDecision(fan, { requiredPoints: 6000, requiredLevel: 'Diamond', reviewRequired: false }).status).toBe('not_enough_points');
    expect(getRewardDecision(fan, { requiredPoints: 5000, requiredLevel: 'Diamond', reviewRequired: true }).status).toBe('requires_review');
    expect(getRewardDecision({ availablePoints: 800, lifetimeGrowthPoints: 200 }, { requiredPoints: 300, requiredLevel: 'Silver' }).status).toBe('level_locked');
  });

  test('resolves store activity verification into system-awarded points', () => {
    const decision = resolveStoreActivityVerification({
      code: 'fan.preview@uwell.com',
      fan: { id: 'f-001', email: 'fan.preview@uwell.com' },
      campaign: { id: 'ca-store-001', name: 'Store tasting', reward_points: 60 },
      ruleSettings: { highValueRewardReviewThreshold: 3000, storeEventMinPoints: 20 },
    });

    expect(decision.status).toBe('points_added');
    expect(decision.points).toBe(60);
    expect(decision.pointsAwardStatus).toBe('system_awarded');
    expect(decision.requiresBackendReview).toBe(false);
  });

  test('presents active S Stores to fans as UWELL Brand Stores without operational details', () => {
    const activeSStore = {
      id: 's-store-1',
      level: 'S',
      is_s_store: true,
      s_store_status: 'active',
    };
    const downgradedSStore = {
      id: 's-store-2',
      level: 'A',
      is_s_store: false,
      s_store_status: 'downgraded',
    };
    const aStore = { id: 'a-store-1', level: 'A' };

    expect(isActiveSStoreForFans(activeSStore)).toBe(true);
    expect(isActiveSStoreForFans(downgradedSStore)).toBe(false);
    expect(getFanFacingStorePresentation(activeSStore)).toMatchObject({
      fanLabel: 'UWELL Brand Store',
      trustCopy: 'Official UWELL brand experience and premium reward pickup readiness.',
      pickupLabel: 'Premium pickup ready',
    });
    expect(getFanFacingStorePresentation(aStore)).toMatchObject({
      fanLabel: 'Recommended UWELL partner',
      pickupLabel: 'Pickup eligible',
    });
    expect(getFanFacingStorePresentation(activeSStore).trustCopy).not.toMatch(/sell-through|inventory|replenishment|audit|downgrade/i);
  });

  test('blocks duplicate store activity verification from earning points', () => {
    const decision = resolveStoreActivityVerification({
      code: 'f-001',
      fan: { id: 'f-001' },
      campaign: { id: 'ca-store-001', reward_points: 60 },
      isDuplicate: true,
    });

    expect(decision.status).toBe('duplicate');
    expect(decision.points).toBe(0);
    expect(decision.pointsAwardStatus).toBe('not_awarded_duplicate');
    expect(decision.requiresBackendReview).toBe(true);
  });

  test('sends high-value or unidentified store activity verification to review', () => {
    expect(resolveStoreActivityVerification({
      code: 'unknown-fan',
      fan: null,
      campaign: { id: 'ca-store-001', reward_points: 60 },
    }).pointsAwardStatus).toBe('pending_review_unmatched_fan');

    expect(resolveStoreActivityVerification({
      code: 'f-001',
      fan: { id: 'f-001' },
      campaign: { id: 'ca-store-002', reward_points: 5000 },
      ruleSettings: { highValueRewardReviewThreshold: 3000 },
    }).pointsAwardStatus).toBe('pending_review_high_value');
  });
});
