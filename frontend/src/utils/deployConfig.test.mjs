import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const rootDir = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const frontendDir = resolve(fileURLToPath(new URL('../..', import.meta.url)));

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function hasRewrite(config, source, destination) {
  return config.rewrites?.some((rewrite) => (
    rewrite.source === source && rewrite.destination === destination
  ));
}

test('root vercel config preserves fan and store html entry points', () => {
  const config = readJson(resolve(rootDir, 'vercel.json'));

  assert.equal(hasRewrite(config, '/fan-app.html', '/fan-app.html'), true);
  assert.equal(hasRewrite(config, '/store-app.html', '/store-app.html'), true);
  assert.equal(hasRewrite(config, '/fan-app.html/(.*)', '/fan-app.html'), true);
  assert.equal(hasRewrite(config, '/store-app.html/(.*)', '/store-app.html'), true);
});

test('frontend vercel config preserves fan and store html entry points', () => {
  const config = readJson(resolve(frontendDir, 'vercel.json'));

  assert.equal(hasRewrite(config, '/fan-app.html', '/fan-app.html'), true);
  assert.equal(hasRewrite(config, '/store-app.html', '/store-app.html'), true);
  assert.equal(hasRewrite(config, '/fan-app.html/(.*)', '/fan-app.html'), true);
  assert.equal(hasRewrite(config, '/store-app.html/(.*)', '/store-app.html'), true);
});
