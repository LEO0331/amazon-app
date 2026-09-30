import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertPublicContent } from './publication-policy.mjs';
import { auditHtmlLinks } from './site-urls.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const content = join(root, 'src/content/objects');
const files = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]);
const html = files(dist).filter((file) => file.endsWith('.html'));
const required = ['index.html', 'made/index.html', 'collected/index.html', 'archive/index.html', 'about/index.html', 'zh/index.html', 'zh/made/index.html', 'zh/collected/index.html', 'zh/archive/index.html', 'zh/about/index.html'];

assertPublicContent(content);
for (const page of required) if (!existsSync(join(dist, page))) throw new Error(`Missing route: ${page}`);
const slugs = new Set(readdirSync(content).filter((name) => name.endsWith('.md')).map((name) => name.slice(0, -3)));
for (const slug of slugs) {
  if (!existsSync(join(dist, 'item', slug, 'index.html'))) throw new Error(`Missing public item: ${slug}`);
  if (!existsSync(join(dist, 'zh', 'item', slug, 'index.html'))) throw new Error(`Missing Chinese public item: ${slug}`);
}
for (const itemDir of [join(dist, 'item'), join(dist, 'zh', 'item')]) {
  for (const entry of readdirSync(itemDir, { withFileTypes: true })) {
    if (entry.isDirectory() && !slugs.has(entry.name)) throw new Error(`Unexpected item route: ${entry.name}`);
  }
}

for (const file of html) {
  const page = relative(dist, file).replaceAll('\\', '/');
  const source = readFileSync(file, 'utf8');
  const language = page.startsWith('zh/') ? 'zh-TW' : 'en';
  if (!source.includes(`<html lang="${language}"`)) throw new Error(`Wrong document language: ${page}`);
  if (!source.includes('hreflang="en"') || !source.includes('hreflang="zh-TW"')) throw new Error(`Missing language alternatives: ${page}`);
  auditHtmlLinks(source, page, (path) => existsSync(join(dist, path)));
}

console.log(`Verified ${html.length} English/Chinese pages, public-only records, and base-aware links/assets.`);
