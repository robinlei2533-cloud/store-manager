export const DISPLAY_CATEGORIES = [
  { key: 'product_placement', label: '产品摆放位置' },
  { key: 'material_placement', label: '店内物料摆放位置' },
  { key: 'activity_showcase', label: 'UWELL 活动图片展示' },
  { key: 'hot_products', label: '热卖 UWELL 产品' },
];

export const STORE_LEVEL_LABELS = {
  S: { label: '钻石', color: '#B9F2FF' },
  A: { label: '黄金', color: '#FFD700' },
  B: { label: '白银', color: '#C0C0C0' },
  C: { label: '青铜', color: '#CD7F32' },
};

export const FAN_LEVEL_LABELS = {
  bronze: '青铜',
  silver: '白银',
  gold: '黄金',
  platinum: '钻石',
  diamond: '钻石',
};

export const STORE_RECOMMEND_LEVELS = ['S', 'A', 'B', 'C'];

export function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function getDisplayCategoryLabel(category) {
  return DISPLAY_CATEGORIES.find((item) => item.key === category)?.label || category;
}

export function getStoreLevelLabel(level) {
  const cfg = STORE_LEVEL_LABELS[level] || STORE_LEVEL_LABELS.C;
  return `${level || 'C'} ${cfg.label}`;
}
