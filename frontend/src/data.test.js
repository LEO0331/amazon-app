import { describe, expect, it } from 'vitest';
import data from './data';
import { existsSync } from 'node:fs';

const MIN_PIXEL_IMAGE_COUNT = 20;

describe('data', () => {
  it('contains a product seed list with expected shape', () => {
    expect(Array.isArray(data.products)).toBe(true);
    expect(data.products.length).toBeGreaterThanOrEqual(MIN_PIXEL_IMAGE_COUNT);
    const first = data.products[0];
    expect(first).toHaveProperty('_id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('price');
  });

  it('references at least 20 unique pixel image assets that exist', () => {
    const pixelImages = data.products
      .map((product) => product.image)
      .filter((image) => /^\/images\/pixel-\d+\.svg$/.test(image));

    expect(new Set(pixelImages).size).toBeGreaterThanOrEqual(MIN_PIXEL_IMAGE_COUNT);
    pixelImages.forEach((image) => {
      expect(existsSync(new URL(`../public${image}`, import.meta.url))).toBe(true);
    });
  });
});
