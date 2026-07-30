import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./MaterialListPage.jsx', import.meta.url), 'utf8');

test('material operations use shared action RBAC helpers instead of scattered role checks', () => {
  assert.match(source, /canApproveMaterialRequest/);
  assert.match(source, /canUpdateMaterialStock/);
  assert.match(source, /canSubmitMaterialRequest/);
  assert.match(source, /canApproveMaterialRequest\(profile\)/);
  assert.match(source, /canUpdateMaterialStock\(profile\)/);
  assert.match(source, /canSubmitMaterialRequest\(profile\)/);
  assert.doesNotMatch(source, /profile\?\.role\s*===\s*ROLES\.ADMIN\s*\|\|\s*profile\?\.role\s*===\s*ROLES\.MANAGER/);
});

test('material list keeps mobile tabs and tables contained without deprecated Space direction', () => {
  const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.match(source, /admin-materials-page/);
  assert.match(source, /admin-materials-tabs/);
  assert.match(source, /admin-materials-catalog-card/);
  assert.match(source, /admin-materials-table/);
  assert.doesNotMatch(source, /<Space\s+direction="vertical"/);
  assert.match(source, /<Space\s+orientation="vertical"/);

  assert.match(css, /\.admin-liquid-shell \.admin-materials-page/);
  assert.match(css, /\.admin-liquid-shell \.admin-materials-tabs/);
  assert.match(css, /\.admin-liquid-shell \.admin-materials-catalog-card/);
  assert.match(css, /\.admin-liquid-shell \.admin-materials-table/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.admin-liquid-shell \.admin-materials-tabs \.ant-tabs-nav-list[\s\S]*overflow-x: auto/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.admin-liquid-shell \.admin-materials-table \.ant-table-cell[\s\S]*white-space: nowrap/);
});

test('material catalog table keeps readable placeholders and avoids fixed action overlap', () => {
  const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');
  const catalogSource = source.slice(source.indexOf('const CatalogTab'), source.indexOf('// ============ Stock Dashboard Tab ============'));

  assert.match(catalogSource, /className="admin-material-image-placeholder"/);
  assert.match(catalogSource, />No image</);
  assert.doesNotMatch(catalogSource, /fontSize:\s*10[\s\S]*>N\/A</);
  assert.doesNotMatch(catalogSource, /fixed:\s*['"]right['"]/);
  assert.match(catalogSource, /title="Edit material" aria-label="Edit material"/);
  assert.match(catalogSource, /title="Delete material" aria-label="Delete material"/);

  assert.match(css, /\.admin-liquid-shell \.admin-materials-table \.ant-table-thead > tr > th[\s\S]*font-size: 12px !important/);
  assert.match(css, /\.admin-liquid-shell \.admin-material-image-placeholder[\s\S]*font-size: 12px/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.admin-liquid-shell \.admin-materials-table \.ant-btn\[aria-label\][\s\S]*width: 32px/);
});
