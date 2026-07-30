import { test } from 'vitest';
import assert from 'node:assert/strict';

import { DISPLAY_CATEGORY_LABELS, getDisplayCategoryLabel } from './uwellClosedLoop.js';

test('display review category labels are English-first for trial portals', () => {
  assert.equal(DISPLAY_CATEGORY_LABELS.product_placement, 'Product display position');
  assert.equal(DISPLAY_CATEGORY_LABELS.material_placement, 'In-store material placement');
  assert.equal(DISPLAY_CATEGORY_LABELS.hot_products, 'Best-selling UWELL products');
  assert.equal(getDisplayCategoryLabel('store_front_photo'), 'Storefront photo');
  assert.equal(getDisplayCategoryLabel('display_photos'), 'Display photos');
});
