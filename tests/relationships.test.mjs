import test from 'node:test';
import assert from 'node:assert/strict';
import { rankRelated, validateRelatedReferences } from '../src/lib/relationships.mjs';

const entry = (id, data = {}) => ({ id: `${id}.md`, data: {
  title: id, type: 'made', category: 'Other', tags: [], materials: [], related: [], visibility: 'public', ...data,
} });

test('explicit links outrank inferred similarities and backlinks work for memories', () => {
  const wallet = entry('wallet', { category: 'Leather', tags: ['leather'], materials: ['Leather'] });
  const card = entry('card', { category: 'Leather', tags: ['leather'], materials: ['Leather'] });
  const memory = entry('memory', { type: 'memory', category: 'Archive note', related: ['wallet'] });
  assert.deepEqual(rankRelated(wallet, [card, memory]).map((item) => item.id), ['memory.md', 'card.md']);
});

test('shared tags and materials outrank same-type fallback', () => {
  const source = entry('source', { tags: ['paper'], materials: ['Canvas'] });
  const plain = entry('plain');
  const material = entry('material', { materials: ['Canvas'] });
  const tagged = entry('tagged', { tags: ['paper'] });
  assert.deepEqual(rankRelated(source, [plain, material, tagged]).map((item) => item.id), ['tagged.md', 'material.md', 'plain.md']);
});

test('current, family, and private entries are excluded and ties are deterministic', () => {
  const source = entry('source');
  const zed = entry('zed');
  const alpha = entry('alpha');
  const hidden = entry('hidden', { visibility: 'private', related: ['source'] });
  assert.deepEqual(rankRelated(source, [source, zed, hidden, alpha]).map((item) => item.id), ['alpha.md', 'zed.md']);
  assert.deepEqual(rankRelated(hidden, [source]), []);
});

test('explicit references must resolve to another public record', () => {
  const hidden = entry('hidden', { visibility: 'family' });
  assert.throws(() => validateRelatedReferences([entry('source', { related: ['hidden'] }), hidden]), /Invalid public related slug/);
  assert.throws(() => validateRelatedReferences([entry('source', { related: ['source'] })]), /Invalid public related slug/);
  assert.doesNotThrow(() => validateRelatedReferences([entry('source', { related: ['memory'] }), entry('memory', { type: 'memory' })]));
});
