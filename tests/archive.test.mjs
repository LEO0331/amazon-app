import test from 'node:test';
import assert from 'node:assert/strict';
import { filterObjects, isPublic } from '../src/lib/archive.mjs';

const entries = [
  { id: 'wallet', data: { title: 'Leather Wallet', summary: 'A folded piece', type: 'made', category: 'Leather goods', status: 'in-use', year: 2025, dateAdded: '2026-09-20', materials: ['Leather'], tags: ['everyday'], visibility: 'public' } },
  { id: 'camera', data: { title: 'Film Camera', summary: 'Kept for photographs', story: 'Its folded hinges made it easy to carry.', type: 'collected', category: 'Cameras', status: 'archived', year: 1982, dateAdded: '2026-09-25', tags: ['photography'], visibility: 'public' } },
  { id: 'private-note', data: { title: 'PRIVATE SENTINEL', summary: 'Family story', type: 'memory', category: 'Notes', status: 'at-home', year: 2026, dateAdded: '2026-09-26', visibility: 'private' } },
];

test('public boundary excludes nonpublic records before page data is prepared', () => {
  assert.deepEqual(entries.filter(isPublic).map((entry) => entry.id), ['wallet', 'camera']);
});

test('archive filters search fields and structured facets', () => {
  const publicEntries = entries.filter(isPublic);
  assert.deepEqual(filterObjects(publicEntries, { query: 'leather', material: 'Leather' }).map((entry) => entry.id), ['wallet']);
  assert.deepEqual(filterObjects(publicEntries, { status: 'archived', type: 'collected', tag: 'photography' }).map((entry) => entry.id), ['camera']);
  assert.deepEqual(filterObjects(publicEntries, { query: 'hinges' }).map((entry) => entry.id), ['camera']);
  assert.deepEqual(filterObjects(publicEntries, { query: 'missing' }), []);
});

test('archive sorting supports added date and object year', () => {
  const publicEntries = entries.filter(isPublic);
  assert.deepEqual(filterObjects(publicEntries).map((entry) => entry.id), ['camera', 'wallet']);
  assert.deepEqual(filterObjects(publicEntries, { sort: 'year-desc' }).map((entry) => entry.id), ['wallet', 'camera']);
  assert.deepEqual(filterObjects(publicEntries, { sort: 'year-asc' }).map((entry) => entry.id), ['camera', 'wallet']);
});
