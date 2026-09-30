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
const required = ['index.html', 'made/index.html', 'collected/index.html', 'archive/index.html', 'about/index.html'];

assertPublicContent(content);
for (const page of required) if (!existsSync(join(dist, page))) throw new Error(`Missing route: ${page}`);
const slugs = new Set(readdirSync(content).filter((name) => name.endsWith('.md')).map((name) => name.slice(0, -3)));
for (const slug of slugs) {
  if (!existsSync(join(dist, 'item', slug, 'index.html'))) throw new Error(`Missing public item: ${slug}`);
}
for (const entry of readdirSync(join(dist, 'item'), { withFileTypes: true })) {
  if (entry.isDirectory() && !slugs.has(entry.name)) throw new Error(`Unexpected item route: ${entry.name}`);
}

for (const file of html) {
  auditHtmlLinks(readFileSync(file, 'utf8'), relative(dist, file).replaceAll('\\', '/'), (path) => existsSync(join(dist, path)));
}

console.log(`Verified ${html.length} pages, public-only records, and base-aware links/assets.`);
