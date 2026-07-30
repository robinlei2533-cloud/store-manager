export const DISPLAY_CATEGORIES = [
  { key: 'product_placement', label: '产品摆放位置' },
  { key: 'material_placement', label: '店内物料摆放位置' },
  { key: 'activity_showcase', label: 'UWELL 活动图片展示' },
  { key: 'hot_products', label: '热卖 UWELL 产品' },
];

export const STORE_LEVEL_LABELS = {
  S: { label: 'Featured', color: '#B9F2FF' },
  A: { label: 'Recommended', color: '#FFD700' },
  B: { label: 'Listed', color: '#C0C0C0' },
  C: { label: 'Listed', color: '#CD7F32' },
};

export const FAN_LEVEL_LABELS = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Diamond',
  diamond: 'Diamond',
};

export const DISPLAY_CATEGORY_LABELS = {
  product_placement: 'Product display position',
  material_placement: 'In-store material placement',
  activity_showcase: 'UWELL activity showcase',
  hot_products: 'Best-selling UWELL products',
  store_front_photo: 'Storefront photo',
  display_photos: 'Display photos',
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
  return DISPLAY_CATEGORY_LABELS[category] || DISPLAY_CATEGORIES.find((item) => item.key === category)?.label || category;
}

export function getStoreLevelLabel(level) {
  const cfg = STORE_LEVEL_LABELS[level] || STORE_LEVEL_LABELS.C;
  return `${level || 'C'} ${cfg.label}`;
}
