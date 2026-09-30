import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('../', import.meta.url).pathname.replace(/^\/(?=[A-Za-z]:)/, '');
const dist = join(root, 'dist');
const content = join(root, 'src/content/objects');
const files = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]);
const html = files(dist).filter((file) => file.endsWith('.html'));
const allOutput = files(dist).filter((file) => /\.(?:html|js|json)$/.test(file)).map((file) => readFileSync(file, 'utf8')).join('\n');
const required = ['index.html', 'made/index.html', 'collected/index.html', 'archive/index.html', 'about/index.html'];

for (const page of required) if (!existsSync(join(dist, page))) throw new Error(`Missing route: ${page}`);
for (const file of readdirSync(content).filter((name) => name.endsWith('.md'))) {
  const source = readFileSync(join(content, file), 'utf8');
  const visibility = source.match(/^visibility:\s*(\S+)/m)?.[1];
  const title = source.match(/^title:\s*(.+)$/m)?.[1];
  const slug = file.slice(0, -3);
  if (visibility === 'public' && !existsSync(join(dist, 'item', slug, 'index.html'))) throw new Error(`Missing public item: ${slug}`);
  if (visibility !== 'public' && (existsSync(join(dist, 'item', slug)) || (title && allOutput.includes(title)))) throw new Error(`Nonpublic record emitted: ${slug}`);
}

for (const file of html) {
  const page = readFileSync(file, 'utf8');
  for (const match of page.matchAll(/(?:href|src)="(\/amazon-app\/[^"?#]+)"/g)) {
    const relativePath = decodeURIComponent(match[1].slice('/amazon-app/'.length));
    const target = join(dist, relativePath);
    if (!existsSync(target) && !existsSync(join(target, 'index.html'))) throw new Error(`Broken local path ${match[1]} in ${relative(dist, file)}`);
  }
}

console.log(`Verified ${html.length} pages, public-only records, and local links/assets.`);
