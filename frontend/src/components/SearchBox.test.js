/* @vitest-environment jsdom */
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchBox from './SearchBox';

afterEach(() => {
  cleanup();
});

describe('SearchBox', () => {
  it('pushes search path on submit with typed query', () => {
    const history = { push: vi.fn() };
    render(<SearchBox history={history} />);

    fireEvent.change(screen.getByPlaceholderText('Search products...'), {
      target: { value: 'keyboard' },
    });
    fireEvent.submit(screen.getByRole('button'));

    expect(history.push).toHaveBeenCalledWith('/search/name/keyboard');
  });

  it('pushes empty query path when submitted without typing', () => {
    const history = { push: vi.fn() };
    render(<SearchBox history={history} />);

    fireEvent.submit(screen.getByRole('button'));
    expect(history.push).toHaveBeenCalledWith('/search/name/');
  });
});
