import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./qrcodes.js', import.meta.url), 'utf8');

test('local QR scans require an explicit or session fan identity', () => {
  assert.match(source, /function normalizeScanArgs/);
  assert.match(source, /getCurrentLocalFanId\(explicitFanId\)/);
  assert.match(source, /Fan identity is required before scanning this QR code/);
  assert.doesNotMatch(source, /localDb\.find\('fans',\s*\(f\)\s*=>\s*f\.store_id === qr\.store_id\)\[0\]/);
});

test('admin demo QR scan fallback uses the configured fan preview account, not table order', () => {
  assert.match(source, /function getDemoLocalFan/);
  assert.match(source, /fan\.preview@uwell\.com/);
  assert.doesNotMatch(source, /localDb\.all\('fans'\)\[0\]/);
});
