import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** V1 is a public build. Reject non-public source before Astro processes image imports. */
export function assertPublicContent(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      assertPublicContent(path);
      continue;
    }
    if (entry.isSymbolicLink()) throw new Error(`Content symlinks are not supported: ${path}`);
    if (!/\.mdx?$/.test(entry.name)) continue;

    const source = readFileSync(path, 'utf8');
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
    if (!frontmatter) throw new Error(`Missing frontmatter or visibility in ${path}`);
    const declarations = [...frontmatter.matchAll(/^visibility\s*:\s*(.*)$/gm)];
    if (declarations.length !== 1) throw new Error(`Expected exactly one visibility declaration in ${path}`);

    const raw = declarations[0][1].trim();
    const value = raw.match(/^(['"])(.*)\1$/)?.[2] ?? raw;
    if (value !== 'public') throw new Error(`Non-public content is not allowed in this V1 public build: ${path}`);
  }
}
