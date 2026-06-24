// Role definitions
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  REP: 'rep',
  FAN: 'fan',
};

export const ROLE_NAMES = {
  admin: 'Administrator',
  manager: 'Manager',
  rep: 'Field Rep',
  fan: 'Fan / Store',
};

export const hasPermission = (profile, requiredRole) => {
  if (!profile) return false;
  const roleHierarchy = { admin: 4, manager: 3, rep: 2, fan: 1 };
  return (roleHierarchy[profile.role] || 0) >= (roleHierarchy[requiredRole] || 0);
};

// Store levels - now includes S tier
export const STORE_LEVELS = [
  { label: 'Level S (VIP)', value: 'S' },
  { label: 'Level A', value: 'A' },
  { label: 'Level B', value: 'B' },
  { label: 'Level C', value: 'C' },
];

export const STORE_LEVEL_COLORS = {
  S: 'purple',
  A: 'red',
  B: 'blue',
  C: 'default',
};

export const PHOTO_TYPES = [
  { label: 'Shelf Display', value: 'shelf' },
  { label: 'Product Display', value: 'display' },
  { label: 'Store Exterior', value: 'exterior' },
  { label: 'Product Close-up', value: 'product' },
];

export const VISIT_STATUS = {
  DRAFT: 'draft',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Fan levels - L1 to L5 naming
export const FAN_LEVELS = [
  { label: 'L1 Bronze', value: 'bronze', color: '#CD7F32', min_points: 0 },
  { label: 'L2 Silver', value: 'silver', color: '#C0C0C0', min_points: 100 },
  { label: 'L3 Gold', value: 'gold', color: '#FFD700', min_points: 500 },
  { label: 'L4 Platinum', value: 'platinum', color: '#E5E4E2', min_points: 2000 },
  { label: 'L5 Diamond', value: 'diamond', color: '#B9F2FF', min_points: 5000 },
];

export const OUTBOUND_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DELIVERED: 'delivered',
};

// Evaluation dimensions
export const EVAL_DIMENSIONS = [
  { key: 'score_sales', label: 'Sales / Order Frequency', desc: 'Recent sales volume and order frequency' },
  { key: 'score_display', label: 'Display Quality', desc: 'Product display standards and shelf richness' },
  { key: 'score_location', label: 'Location & Traffic', desc: 'Store location and foot traffic' },
  { key: 'score_cooperation', label: 'Owner Cooperation', desc: 'Owner cooperation and activity participation' },
  { key: 'score_expansion', label: 'Chain / Expansion Potential', desc: 'Chain brand status and expansion plans' },
  { key: 'score_appearance', label: 'Store Appearance', desc: 'Storefront image and interior cleanliness' },
];

// Campaign types
export const CAMPAIGN_TYPES = [
  'Promotion', 'New Product Launch', 'Holiday Marketing', 'Brand Promotion', 'Store Expansion', 'Community Event'
];

// Campaign status
export const CAMPAIGN_STATUS = {
  PLANNED: 'planned',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Lottery prize tiers
export const LOTTERY_PRIZES = [
  { id: 'grand', label: 'Grand Prize', points: 500, probability: 0.01, icon: '🏆' },
  { id: 'first', label: 'First Prize', points: 200, probability: 0.05, icon: '🥇' },
  { id: 'second', label: 'Second Prize', points: 100, probability: 0.10, icon: '🥈' },
  { id: 'third', label: 'Third Prize', points: 50, probability: 0.20, icon: '🥉' },
  { id: 'consolation', label: 'Consolation', points: 10, probability: 0.30, icon: '🎁' },
  { id: 'none', label: 'Try Again', points: 0, probability: 0.34, icon: '❌' },
];

// Points mall items
export const MALL_ITEMS = [
  { id: 'mall-001', name: 'UWELL G4 Device', points_cost: 800, image: '', stock: 50, category: 'Device' },
  { id: 'mall-002', name: 'UWELL KOKO Device', points_cost: 500, image: '', stock: 80, category: 'Device' },
  { id: 'mall-003', name: 'UWELL Pod Pack (3pcs)', points_cost: 150, image: '', stock: 200, category: 'Pod' },
  { id: 'mall-004', name: 'UWELL T-Shirt', points_cost: 300, image: '', stock: 100, category: 'Merch' },
  { id: 'mall-005', name: 'UWELL Cap', points_cost: 200, image: '', stock: 150, category: 'Merch' },
  { id: 'mall-006', name: 'UWEL Store Coupon 50SR', points_cost: 400, image: '', stock: 100, category: 'Coupon' },
  { id: 'mall-007', name: 'UWELL VIP Badge', points_cost: 1000, image: '', stock: 20, category: 'VIP' },
  { id: 'mall-008', name: 'UWELL Lighter', points_cost: 80, image: '', stock: 300, category: 'Merch' },
];
