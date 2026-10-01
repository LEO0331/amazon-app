import { isPublic } from './archive.mjs';

const slug = (entry) => entry.id.replace(/\.md$/, '');
const sharedCount = (left = [], right = []) => {
  const values = new Set(left);
  return [...new Set(right)].filter((value) => values.has(value)).length;
};

export function validateRelatedReferences(entries) {
  const publicEntries = entries.filter(isPublic);
  const slugs = new Set(publicEntries.map(slug));
  for (const entry of publicEntries) {
    for (const related of entry.data.related ?? []) {
      if (related === slug(entry) || !slugs.has(related)) {
        throw new Error(`Invalid public related slug "${related}" in ${slug(entry)}`);
      }
    }
  }
}

export function rankRelated(current, entries, limit = 4) {
  if (!isPublic(current)) return [];
  const currentSlug = slug(current);
  return entries
    .filter((candidate) => isPublic(candidate) && slug(candidate) !== currentSlug)
    .map((candidate) => {
      const explicit = (current.data.related ?? []).includes(slug(candidate)) ||
        (candidate.data.related ?? []).includes(currentSlug);
      const evidence = sharedCount(current.data.tags, candidate.data.tags) * 16 +
        sharedCount(current.data.materials, candidate.data.materials) * 8 +
        (current.data.category === candidate.data.category ? 4 : 0) +
        (current.data.type === candidate.data.type ? 1 : 0);
      return { candidate, explicit, evidence };
    })
    .filter(({ explicit, evidence }) => explicit || evidence > 0)
    .sort((left, right) => Number(right.explicit) - Number(left.explicit) ||
      right.evidence - left.evidence ||
      left.candidate.data.title.localeCompare(right.candidate.data.title) ||
      slug(left.candidate).localeCompare(slug(right.candidate)))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
