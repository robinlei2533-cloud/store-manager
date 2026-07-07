export const legalPolicyMeta = {
  lastUpdated: 'July 7, 2026',
  contactEmail: 'privacy@uwell.com',
};

export const rewardRules = {
  title: 'Reward Redemption Rules',
  operatorNote: '运营备注：粉丝兑换后生成唯一兑奖码，只能到 S 级门店核销；核销成功后奖品库存扣减。',
  summary: 'Redeem points for eligible rewards, then collect the reward at an approved S-level UWELL store.',
  items: [
    'A redemption code is generated after points are deducted and the reward is reserved.',
    'The code can be fulfilled only by an approved S-level UWELL store listed in the UWELL Store Portal.',
    'Each code can be used once. After successful pickup, the code status changes to picked up and cannot be reused.',
    'The default validity period is 30 days from redemption unless a campaign states a shorter period.',
    'The fan must show the redemption code in the Fan Center. The store may ask to confirm the fan account or phone number.',
    'Rewards are subject to store inventory. If the selected S-level store has no stock, the fan should visit another S-level store or contact support.',
    'UWELL may cancel suspicious redemptions, freeze abnormal points, or refuse fulfillment for fraud, resale, duplicated screenshots, or account misuse.',
  ],
};

export const sLevelStorePolicy = {
  title: 'S-Level Store Responsibility and Reward Policy',
  operatorNote: '运营备注：S 级门店承担兑奖核销和库存准确责任，平台按核销质量、库存准确率和服务记录给激励。',
  responsibilities: [
    'Verify the redemption code in the Store Portal before handing over any reward.',
    'Confirm the displayed reward name and quantity match the physical item being handed to the fan.',
    'Complete pickup confirmation only after the fan receives the reward in store.',
    'Keep reward inventory accurate. Successful confirmation deducts the corresponding reward stock.',
    'Do not fulfill expired, already used, copied, manually altered, or off-platform redemption codes.',
    'Escalate suspicious pickup attempts to UWELL operations instead of completing the pickup.',
    'Maintain basic service quality: clear explanation, no extra charge for official rewards, and respectful treatment of fans.',
  ],
  rewards: [
    'S-level stores receive priority access to official reward inventory and display materials.',
    'Monthly pickup records can be used for store ranking, campaign invitations, and service incentives.',
    'Stores with accurate inventory and clean pickup records may receive priority UWELL lightbox, acrylic stand, or campaign support.',
    'Repeated incorrect confirmations, private redemption, or inventory mismatch may reduce store rating or suspend reward fulfillment permission.',
  ],
};

export const memberTermsHighlights = [
  'Users must be of legal age in their region and provide accurate account information.',
  'Points have no cash value and cannot be sold, transferred, exchanged for cash, or traded outside the UWELL platform.',
  'UWELL may review, adjust, freeze, or cancel points and redemptions when fraud, system abuse, duplicated scans, or account misuse is detected.',
  'Store pickup rewards follow the Reward Redemption Rules and S-Level Store Responsibility Policy.',
];
