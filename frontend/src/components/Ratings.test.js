/* @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Ratings from './Ratings';

function classesFor(rating) {
  const { container } = render(<Ratings rating={rating} numReviews={10} />);
  return [...container.querySelectorAll('i')].map((node) => node.className);
}

describe('Ratings', () => {
  it('renders empty stars for zero rating', () => {
    expect(classesFor(0)).toEqual([
      'fa fa-star-o',
      'fa fa-star-o',
      'fa fa-star-o',
      'fa fa-star-o',
      'fa fa-star-o',
    ]);
    expect(screen.getByText('10 reviews')).toBeTruthy();
  });

  it('renders mixed full/half/empty stars', () => {
    expect(classesFor(2.5)).toEqual([
      'fa fa-star',
      'fa fa-star',
      'fa fa-star-half-o',
      'fa fa-star-o',
      'fa fa-star-o',
    ]);
  });

  it('renders fourth-star half branch', () => {
    expect(classesFor(3.5)).toEqual([
      'fa fa-star',
      'fa fa-star',
      'fa fa-star',
      'fa fa-star-half-o',
      'fa fa-star-o',
    ]);
  });

  it('renders all full stars for max rating and caption when provided', () => {
    const { container } = render(<Ratings rating={5} caption="5 stars" />);
    const stars = [...container.querySelectorAll('i')].map((node) => node.className);
    expect(stars).toEqual([
      'fa fa-star',
      'fa fa-star',
      'fa fa-star',
      'fa fa-star',
      'fa fa-star',
    ]);
    expect(screen.getByText('5 stars')).toBeTruthy();
  });
});
