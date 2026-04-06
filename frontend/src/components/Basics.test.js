/* @vitest-environment jsdom */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CheckoutSteps from './CheckoutSteps';
import LoadingBox from './LoadingBox';
import MessageBox from './MessageBox';
import Products from './Products';

describe('basic components', () => {
  it('renders checkout step active state', () => {
    render(<CheckoutSteps step1 step3 />);
    const signIn = screen.getByText('Sign-In');
    const shipping = screen.getByText('Shipping');
    expect(signIn.className).toContain('active');
    expect(shipping.className).toBe('');
  });

  it('renders loading and message variants', () => {
    const { rerender } = render(<LoadingBox />);
    expect(screen.getByText(/Loading/i)).toBeTruthy();
    rerender(<MessageBox variant="danger">Boom</MessageBox>);
    expect(screen.getByText('Boom').className).toContain('alert-danger');
  });

  it('renders product card links, image and price', () => {
    const product = {
      _id: 'p1',
      name: 'Pixel Blade',
      image: '/img/p1.png',
      rating: 4,
      numReviews: 10,
      price: 88,
      seller: { _id: 's1', seller: { name: 'Retro Shop' } },
    };
    render(
      <MemoryRouter>
        <Products product={product} />
      </MemoryRouter>
    );
    expect(screen.getByText('Pixel Blade')).toBeTruthy();
    expect(screen.getByText('88')).toBeTruthy();
    expect(screen.getByText('Retro Shop')).toBeTruthy();
  });
});
