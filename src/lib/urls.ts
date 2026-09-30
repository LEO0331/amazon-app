const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function sitePath(path = ''): string {
  return `${base}/${path.replace(/^\/+/, '')}`;
}
