import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArchiveParams, serializeArchiveParams } from '../src/lib/archive-url.mjs';

const choices = {
  type: ['made', 'collected', 'memory'],
  category: ['Leather goods', 'Cameras'],
  status: ['in-use', 'archived'],
  tag: ['leather', 'camera'],
};

test('archive filters round-trip through readable URL parameters', () => {
  const state = { query: 'wallet', type: 'made', category: 'Leather goods', status: 'in-use', tag: 'leather', sort: 'year-desc' };
  const params = serializeArchiveParams(state);
  assert.equal(params.toString(), 'query=wallet&type=made&category=Leather+goods&status=in-use&tag=leather&sort=year-desc');
  assert.deepEqual(parseArchiveParams(params, choices), state);
});

test('default archive state leaves the URL clean', () => {
  const state = parseArchiveParams('', choices);
  assert.deepEqual(state, { query: '', type: '', category: '', status: '', tag: '', sort: 'added-desc' });
  assert.equal(serializeArchiveParams(state).toString(), '');
});

test('unknown facets and sort values safely fall back to defaults', () => {
  const state = parseArchiveParams('?type=private&category=Missing&status=sold&tag=none&sort=unknown&extra=ignored', choices);
  assert.deepEqual(state, { query: '', type: '', category: '', status: '', tag: '', sort: 'added-desc' });
});

test('Chinese search text and stable facet values survive URL round-tripping', () => {
  const source = new URLSearchParams({ query: '鉸鏈', type: 'memory', tag: 'camera' });
  const state = parseArchiveParams(source, choices);
  assert.equal(state.query, '鉸鏈');
  assert.equal(serializeArchiveParams(state).toString(), source.toString());
});
