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

export const STORE_LEVELS = [
  { label: 'Level A', value: 'A' },
  { label: 'Level B', value: 'B' },
  { label: 'Level C', value: 'C' },
];

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

export const FAN_LEVELS = [
  { label: 'Bronze', value: 'bronze', color: '#CD7F32' },
  { label: 'Silver', value: 'silver', color: '#C0C0C0' },
  { label: 'Gold', value: 'gold', color: '#FFD700' },
  { label: 'Platinum', value: 'platinum', color: '#E5E4E2' },
  { label: 'Diamond', value: 'diamond', color: '#B9F2FF' },
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
  'Promotion', 'New Product Launch', 'Holiday Marketing', 'Brand Promotion', 'Store Expansion'
];

// Campaign status
export const CAMPAIGN_STATUS = {
  PLANNED: 'planned',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};
