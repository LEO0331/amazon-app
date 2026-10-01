const facets = ['type', 'category', 'status', 'tag'];
const sorts = new Set(['added-desc', 'year-desc', 'year-asc']);

export function parseArchiveParams(input, choices) {
  const params = input instanceof URLSearchParams ? input : new URLSearchParams(input);
  const requestedSort = params.get('sort') ?? 'added-desc';
  const state = {
    query: (params.get('query') ?? '').trim().slice(0, 120),
    type: '', category: '', status: '', tag: '',
    sort: sorts.has(requestedSort) ? requestedSort : 'added-desc',
  };
  for (const key of facets) {
    const value = params.get(key) ?? '';
    state[key] = choices[key]?.includes(value) ? value : '';
  }
  return state;
}

export function serializeArchiveParams(state) {
  const params = new URLSearchParams();
  const query = (state.query ?? '').trim().slice(0, 120);
  if (query) params.set('query', query);
  for (const key of facets) if (state[key]) params.set(key, state[key]);
  if (sorts.has(state.sort) && state.sort !== 'added-desc') params.set('sort', state.sort);
  return params;
}
