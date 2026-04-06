import { describe, expect, it } from 'vitest';
import data from './data';

describe('data', () => {
  it('contains a product seed list with expected shape', () => {
    expect(Array.isArray(data.products)).toBe(true);
    expect(data.products.length).toBeGreaterThan(0);
    const first = data.products[0];
    expect(first).toHaveProperty('_id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('price');
  });
});
