/* @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Ratings from './Ratings';

describe('Ratings', () => {
  it('renders expected star classes for half rating', () => {
    const { container } = render(<Ratings rating={4.5} numReviews={10} />);
    const stars = [...container.querySelectorAll('i')].map((node) => node.className);
    expect(stars).toEqual([
      'fa fa-star',
      'fa fa-star',
      'fa fa-star',
      'fa fa-star',
      'fa fa-star-half-o',
    ]);
    expect(screen.getByText('10 reviews')).toBeTruthy();
  });

  it('renders caption when provided', () => {
    render(<Ratings rating={3} caption="stars & up" />);
    expect(screen.getByText('stars & up')).toBeTruthy();
  });
});
