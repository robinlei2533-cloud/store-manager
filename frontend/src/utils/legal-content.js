export const legalPolicyMeta = {
  lastUpdated: 'July 7, 2026',
  contactEmail: 'privacy@uwell.com',
};

export const rewardRules = {
  title: 'Reward Redemption Rules',
  operatorNote: 'Operations note: the system generates a unique redemption code after points are deducted. Store users verify pickup only; successful pickup deducts reward inventory.',
  summary: 'Redeem points for eligible rewards, then collect the reward at an eligible UWELL store according to the reward type.',
  items: [
    'A redemption code is generated after points are deducted and the reward is reserved.',
    'Normal rewards can be collected at approved A or S-level UWELL stores.',
    'Premium rewards require an approved S-level UWELL store.',
    'Diamond and high-value rewards require backend approval before pickup.',
    'Each code can be used once. After successful pickup, the code status changes to picked up and cannot be reused.',
    'The default validity period is 7 days from redemption unless a campaign states a shorter period.',
    'The fan must show the redemption code in the Fan Center. The store may ask to confirm the fan account or phone number.',
    'Rewards are subject to store inventory. If an eligible store has no stock, the fan should visit another eligible store or contact support.',
    'UWELL may cancel suspicious redemptions, freeze abnormal points, or refuse fulfillment for fraud, resale, duplicated screenshots, or account misuse.',
  ],
};

export const sLevelStorePolicy = {
  title: 'S-Level Store Responsibility and Reward Policy',
  operatorNote: 'Operations note: S-level stores carry premium reward pickup responsibility. UWELL may use pickup quality, inventory accuracy, and service records for store incentives.',
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
