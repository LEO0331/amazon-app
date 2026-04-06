import { describe, expect, it, vi } from 'vitest';
import { prices, ratings, resolveAssetUrl } from './utils';

describe('resolveAssetUrl', () => {
  it('returns same path for external URLs', () => {
    expect(resolveAssetUrl('https://cdn.example.com/a.jpg')).toBe('https://cdn.example.com/a.jpg');
  });

  it('applies frontend base path for local image assets', () => {
    vi.stubEnv('VITE_BASE_PATH', '/amazon-app/');
    expect(resolveAssetUrl('/images/p1.jpg')).toBe('/amazon-app/images/p1.jpg');
    vi.unstubAllEnvs();
  });

  it('returns untouched value for non-image paths', () => {
    expect(resolveAssetUrl('/uploads/user.jpg')).toBe('/uploads/user.jpg');
  });
});

describe('catalog filter constants', () => {
  it('exports rating and price filter defaults', () => {
    expect(ratings.length).toBeGreaterThanOrEqual(4);
    expect(ratings[0]).toEqual({ name: '5stars & up', rating: 5 });
    expect(ratings.map((entry) => entry.rating)).toEqual([5, 4, 3, 2, 1]);
    expect(prices[0]).toEqual({ name: 'Any', min: 0, max: 0 });
  });
});
