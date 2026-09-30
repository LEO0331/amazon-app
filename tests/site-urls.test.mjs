import test from 'node:test';
import assert from 'node:assert/strict';
import { auditHtmlLinks } from '../scripts/site-urls.mjs';

const paths = new Set(['index.html', 'made/index.html', 'favicon.svg', '_astro/site.css', '_astro/photo.svg']);
const exists = (path) => paths.has(path);

test('generated links, images, canonical and Open Graph URLs resolve under the Pages base', () => {
  const html = '<a href="/amazon-app/made/">Made</a><link rel="icon" href="/amazon-app/favicon.svg"><link rel="canonical" href="https://leo0331.github.io/amazon-app/"><meta property="og:image" content="https://leo0331.github.io/amazon-app/_astro/photo.svg"><img src="/amazon-app/_astro/photo.svg" srcset="/amazon-app/_astro/photo.svg 1x"><script src="/amazon-app/_astro/site.css"></script>';
  assert.doesNotThrow(() => auditHtmlLinks(html, 'index.html', exists));
});

test('generated root-relative links outside the project base are rejected', () => {
  assert.throws(() => auditHtmlLinks('<a href="/made/">Made</a>', 'index.html', exists), /outside \/amazon-app\//);
  assert.throws(() => auditHtmlLinks('<meta property="og:url" content="https://leo0331.github.io/made/">', 'index.html', exists), /outside \/amazon-app\//);
});

test('base-prefixed paths must exist in the generated output', () => {
  assert.throws(() => auditHtmlLinks('<img src="/amazon-app/_astro/missing.svg">', 'index.html', exists), /Broken local path/);
});
