import { isPublic } from './archive.mjs';

export function groupByYear(entries) {
  const publicEntries = entries.filter(isPublic).sort((left, right) =>
    right.data.year - left.data.year ||
    new Date(right.data.dateAdded).getTime() - new Date(left.data.dateAdded).getTime() ||
    left.data.title.localeCompare(right.data.title));
  const groups = new Map();
  for (const entry of publicEntries) {
    const year = entry.data.year;
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(entry);
  }
  return [...groups].map(([year, records]) => ({ year, records }));
}
