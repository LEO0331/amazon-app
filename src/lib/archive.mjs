export const isPublic = (entry) => entry.data.visibility === 'public';

export function filterObjects(entries, filters = {}) {
  const query = (filters.query ?? '').trim().toLocaleLowerCase();
  const { type = '', category = '', status = '', tag = '', material = '', sort = 'added-desc' } = filters;
  const filtered = entries.filter((entry) => {
    const data = entry.data ?? entry;
    if (type && data.type !== type) return false;
    if (category && data.category !== category) return false;
    if (status && data.status !== status) return false;
    if (tag && !(data.tags ?? []).includes(tag)) return false;
    if (material && !(data.materials ?? []).includes(material)) return false;
    if (!query) return true;
    return [data.title, data.summary, data.story, data.category, data.maker, data.creator, ...(data.tags ?? []), ...(data.materials ?? [])]
      .filter(Boolean).join(' ').toLocaleLowerCase().includes(query);
  });
  return filtered.sort((a, b) => {
    const left = a.data ?? a;
    const right = b.data ?? b;
    if (sort === 'year-asc') return left.year - right.year || left.title.localeCompare(right.title);
    if (sort === 'year-desc') return right.year - left.year || left.title.localeCompare(right.title);
    return new Date(right.dateAdded).getTime() - new Date(left.dateAdded).getTime() || left.title.localeCompare(right.title);
  });
}
