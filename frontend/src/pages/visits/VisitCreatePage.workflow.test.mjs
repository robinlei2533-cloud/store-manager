import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./VisitCreatePage.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

test('visit create form separates new-store and repeat-visit workflows', () => {
  assert.match(source, /VISIT_TYPE_OPTIONS/);
  assert.match(source, /新店拜访/);
  assert.match(source, /复访/);
  assert.match(source, /visit_type/);
  assert.match(source, /new_store_profile/);
  assert.match(source, /repeat_visit_summary/);
});

test('visit create form captures store profile and display operation data', () => {
  assert.match(source, /门店档案/);
  assert.match(source, /Store name/);
  assert.match(source, /Country/);
  assert.match(source, /City/);
  assert.match(source, /Address/);
  assert.match(source, /Map link/);
  assert.match(source, /Contact person/);
  assert.match(source, /Phone/);
  assert.match(source, /Display Data/);
  assert.match(source, /SKU list/);
  assert.match(source, /Display location/);
  assert.match(source, /Competitor pressure/);
  assert.match(source, /Material needs/);
  assert.match(source, /Record problems and next action/);
});

test('visit create form asks for operational evidence photos', () => {
  assert.match(source, /VISIT_EVIDENCE_TYPES/);
  assert.match(source, /Storefront/);
  assert.match(source, /Shelf/);
  assert.match(source, /Counter display/);
  assert.match(source, /UWELL display/);
  assert.match(source, /Competitor display/);
  assert.match(source, /Activity evidence/);
  assert.match(source, /Manager\/Admin reviews final store level/);
});

test('new-store visit includes inline SABC scoring preview before backend review', () => {
  assert.match(source, /scoreStoreRating/);
  assert.match(source, /FIELD_RATING_FIELDS/);
  assert.match(source, /Field Rating Preview/);
  assert.match(source, /Monthly UWELL sales units/);
  assert.match(source, /Location \/ traffic/);
  assert.match(source, /Storefront \/ signboard image/);
  assert.match(source, /UWELL display quality/);
  assert.match(source, /Campaign readiness/);
  assert.match(source, /System suggestion/);
  assert.match(source, /Manager review required/);
  assert.match(source, /field_rating_summary/);
  assert.match(source, /suggested_store_level/);
});

test('new-store rating explains monthly sales weight and backend final-level control', () => {
  [
    'SALES_SCORE_BANDS',
    'RATING_REVIEW_LADDER',
    'field-rating-rule-strip',
    'field-rating-sales-band-grid',
    'field-rating-review-ladder',
    'Monthly sales is 20% of the S/A/B/C score',
    'C potential: 1-2 units / month',
    'B potential: 2-3 units / month',
    'A potential: 3-4 units / month',
    'S potential: 4-6 units / month',
    'Rep suggestion is not final',
    'Manager can adjust',
    'Admin confirms final level',
    'S/A final stores can receive Fan Home and map exposure',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be visible in visit rating workflow`));
});

test('visit create form has scoped readable labels without changing submission workflow', () => {
  assert.match(source, /admin-visit-create-page/);
  assert.match(source, /admin-visit-create-card/);
  assert.match(source, /handleSubmit/);
  assert.match(source, /createVisit\(visitData\)/);
  assert.match(source, /submitSStoreVisitDetail/);

  assert.match(css, /\.admin-liquid-shell \.admin-visit-create-page/);
  assert.match(css, /\.admin-liquid-shell \.admin-visit-create-page \.ant-form-item-label > label\s*\{[^}]*color:\s*rgba\(36,\s*28,\s*16,\s*0\.82\)\s*!important;/s);
  assert.match(css, /\.admin-liquid-shell \.admin-visit-create-page \.ant-form-item-extra\s*\{[^}]*color:\s*rgba\(36,\s*28,\s*16,\s*0\.64\)\s*!important;/s);
  assert.match(css, /\.admin-liquid-shell \.admin-visit-create-page \.ant-upload-wrapper \.ant-btn-default\s*\{[^}]*color:\s*rgba\(36,\s*28,\s*16,\s*0\.74\)\s*!important;/s);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[^}]*\.admin-liquid-shell \.admin-visit-create-page/s);
});
