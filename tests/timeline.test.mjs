import test from 'node:test';
import assert from 'node:assert/strict';
import { groupByYear } from '../src/lib/timeline.mjs';

const record = (title, year, dateAdded, type = 'made', visibility = 'public') => ({
  id: `${title}.md`, data: { title, year, dateAdded, type, visibility },
});

test('timeline groups public objects and memories by year without inventing event dates', () => {
  const groups = groupByYear([
    record('older', 1990, '2026-09-30'),
    record('memory', 2024, '2026-09-29', 'memory'),
    record('newer', 2024, '2026-09-30'),
    record('hidden', 2026, '2026-09-30', 'memory', 'private'),
  ]);
  assert.deepEqual(groups.map((group) => group.year), [2024, 1990]);
  assert.deepEqual(groups[0].records.map((entry) => entry.data.title), ['newer', 'memory']);
  assert.equal(groups.flatMap((group) => group.records).some((entry) => entry.data.title === 'hidden'), false);
});
