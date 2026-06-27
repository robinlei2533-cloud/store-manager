export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  REP: 'rep',
  FAN: 'fan',
};

export const ROLE_NAMES = {
  admin: '管理员',
  manager: '运营经理',
  rep: '业务代表',
  fan: '粉丝/门店',
};

export const hasPermission = (profile, requiredRole) => {
  if (!profile) return false;
  const roleHierarchy = { admin: 4, manager: 3, rep: 2, fan: 1 };
  return (roleHierarchy[profile.role] || 0) >= (roleHierarchy[requiredRole] || 0);
};

export const STORE_LEVELS = [
  { label: 'S 级重点门店', value: 'S' },
  { label: 'A 级优质门店', value: 'A' },
  { label: 'B 级成长门店', value: 'B' },
  { label: 'C 级基础门店', value: 'C' },
];

export const STORE_LEVEL_COLORS = {
  S: 'purple',
  A: 'red',
  B: 'blue',
  C: 'default',
};

export const PHOTO_TYPES = [
  { label: '货架陈列', value: 'shelf' },
  { label: '产品展示', value: 'display' },
  { label: '门店外观', value: 'exterior' },
  { label: '产品近照', value: 'product' },
];

export const VISIT_STATUS = {
  DRAFT: 'draft',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const FAN_LEVELS = [
  { label: 'L1 青铜会员', value: 'bronze', color: '#CD7F32', min_points: 0 },
  { label: 'L2 白银会员', value: 'silver', color: '#8b949e', min_points: 100 },
  { label: 'L3 黄金会员', value: 'gold', color: '#d97706', min_points: 500 },
  { label: 'L4 铂金会员', value: 'platinum', color: '#64748b', min_points: 2000 },
  { label: 'L5 钻石会员', value: 'diamond', color: '#0891b2', min_points: 5000 },
];

export const OUTBOUND_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DELIVERED: 'delivered',
};

export const EVAL_DIMENSIONS = [
  { key: 'score_sales', label: '销量与进货频率', desc: '近期销量、补货节奏与动销稳定性' },
  { key: 'score_display', label: '陈列质量', desc: '产品陈列规范、货架占位和展示完整度' },
  { key: 'score_location', label: '位置与客流', desc: '门店位置、自然客流和周边消费潜力' },
  { key: 'score_cooperation', label: '老板配合度', desc: '沟通效率、活动参与度和执行意愿' },
  { key: 'score_expansion', label: '连锁/扩张潜力', desc: '是否具备连锁属性、复制能力和拓店机会' },
  { key: 'score_appearance', label: '门店形象', desc: '门头、店内整洁度和品牌展示空间' },
];

export const CAMPAIGN_TYPES = [
  '促销活动',
  '新品推广',
  '节日营销',
  '品牌推广',
  '门店拓展',
  '社区活动',
];

export const CAMPAIGN_STATUS = {
  PLANNED: 'planned',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const LOTTERY_PRIZES = [
  { id: 'grand', label: '特等奖', points: 500, probability: 0.01, icon: 'grand' },
  { id: 'first', label: '一等奖', points: 200, probability: 0.05, icon: 'first' },
  { id: 'second', label: '二等奖', points: 100, probability: 0.10, icon: 'second' },
  { id: 'third', label: '三等奖', points: 50, probability: 0.20, icon: 'third' },
  { id: 'consolation', label: '参与奖', points: 10, probability: 0.30, icon: 'consolation' },
  { id: 'none', label: '谢谢参与', points: 0, probability: 0.34, icon: 'none' },
];

export const MALL_ITEMS = [
  { id: 'mall-001', name: 'UWELL G4 主机', points_cost: 800, image: '', stock: 50, category: 'Device' },
  { id: 'mall-002', name: 'UWELL KOKO 主机', points_cost: 500, image: '', stock: 80, category: 'Device' },
  { id: 'mall-003', name: 'UWELL 烟弹套装 3 支装', points_cost: 150, image: '', stock: 200, category: 'Pod' },
  { id: 'mall-004', name: 'UWELL T 恤', points_cost: 300, image: '', stock: 100, category: 'Merch' },
  { id: 'mall-005', name: 'UWELL 帽子', points_cost: 200, image: '', stock: 150, category: 'Merch' },
  { id: 'mall-006', name: '门店优惠券 50SR', points_cost: 400, image: '', stock: 100, category: 'Coupon' },
  { id: 'mall-007', name: 'UWELL VIP 徽章', points_cost: 1000, image: '', stock: 20, category: 'VIP' },
  { id: 'mall-008', name: 'UWELL 周边打火机', points_cost: 80, image: '', stock: 300, category: 'Merch' },
];
