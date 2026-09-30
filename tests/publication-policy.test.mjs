import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assertPublicContent } from '../scripts/publication-policy.mjs';

function withContent(files, verify) {
  const directory = mkdtempSync(join(tmpdir(), 'family-cabinet-policy-'));
  try {
    for (const [name, content] of Object.entries(files)) {
      const path = join(directory, name);
      mkdirSync(join(path, '..'), { recursive: true });
      writeFileSync(path, content);
    }
    verify(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

const record = (visibility) => `---\ntitle: Fictional object\nvisibility: ${visibility}\n---\nFictional story.\n`;

test('publication policy accepts public records in nested folders', () => {
  withContent({ 'example.md': record('public'), 'nested/other.md': record('"public"') }, (directory) => assert.doesNotThrow(() => assertPublicContent(directory)));
});

test('publication policy rejects family and private records before Astro imports images', () => {
  for (const visibility of ['family', 'private']) {
    withContent({ 'hidden.md': record(visibility) }, (directory) => assert.throws(() => assertPublicContent(directory), /Non-public content/));
  }
});

test('publication policy fails closed for missing or ambiguous visibility', () => {
  withContent({ 'missing.md': '---\ntitle: Missing visibility\n---\nStory.\n' }, (directory) => assert.throws(() => assertPublicContent(directory), /visibility/));
  withContent({ 'duplicate.md': '---\nvisibility: public\nvisibility: private\n---\nStory.\n' }, (directory) => assert.throws(() => assertPublicContent(directory), /visibility/));
});
