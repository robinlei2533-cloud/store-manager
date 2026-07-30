import { readdirSync, readFileSync, statSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const component = readFileSync(new URL('./PageTransition.jsx', import.meta.url), 'utf8');
const animationCss = readFileSync(new URL('../../styles/animations.css', import.meta.url), 'utf8');
const srcRoot = new URL('../../', import.meta.url);

function collectProductionSources(directoryUrl, files = []) {
  for (const entry of readdirSync(directoryUrl, { withFileTypes: true })) {
    const entryUrl = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directoryUrl);
    if (entry.isDirectory()) {
      collectProductionSources(entryUrl, files);
      continue;
    }
    if (!/\.(jsx|js)$/.test(entry.name)) continue;
    if (entry.name.includes('.test.') || entry.name.includes('.bak')) continue;
    if (!statSync(entryUrl).isFile()) continue;
    files.push(entryUrl);
  }
  return files;
}

test('page transition does not pull the motion vendor into every portal shell', () => {
  assert.doesNotMatch(component, /framer-motion|motion\./);
  assert.match(component, /uw-page-transition/);
});

test('page transition keeps a css-only reduced-motion path', () => {
  assert.match(animationCss, /@keyframes uwell-page-enter/);
  assert.match(animationCss, /\.uw-page-transition/);
  assert.match(animationCss, /prefers-reduced-motion:\s*reduce/);
  assert.match(animationCss, /\.uw-page-transition\s*\{\s*animation:\s*none !important;/);
});

test('production portal code does not import framer motion', () => {
  const offenders = collectProductionSources(srcRoot)
    .map((fileUrl) => [fileUrl, readFileSync(fileUrl, 'utf8')])
    .filter(([, source]) => /from ['"]framer-motion['"]/.test(source))
    .map(([fileUrl]) => fileUrl.pathname);

  assert.deepEqual(offenders, []);
});
