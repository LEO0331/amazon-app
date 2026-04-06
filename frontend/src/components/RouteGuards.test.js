/* @vitest-environment jsdom */
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import SellerRoute from './SellerRoute';

afterEach(() => {
  cleanup();
});

function renderWithState(ui, state, initialEntries = ['/']) {
  const store = createStore((s = state) => s);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </Provider>
  );
}

function Protected() {
  return <div>Protected View</div>;
}

function Signin() {
  return <div>Signin View</div>;
}

describe('Route Guards', () => {
  it('PrivateRoute renders component when user exists', () => {
    renderWithState(
      <>
        <PrivateRoute path="/private" component={Protected} />
        <Route path="/signin" component={Signin} />
      </>,
      { userSignin: { userInfo: { _id: 'u1' } } },
      ['/private']
    );
    expect(screen.getByText('Protected View')).toBeTruthy();
  });

  it('PrivateRoute redirects unauthenticated user', () => {
    renderWithState(
      <>
        <PrivateRoute path="/private" component={Protected} />
        <Route path="/signin" component={Signin} />
      </>,
      { userSignin: { userInfo: null } },
      ['/private']
    );
    expect(screen.getByText('Signin View')).toBeTruthy();
  });

  it('AdminRoute allows admin user', () => {
    renderWithState(
      <>
        <AdminRoute path="/admin" component={Protected} />
        <Route path="/signin" component={Signin} />
      </>,
      { userSignin: { userInfo: { isAdmin: true } } },
      ['/admin']
    );
    expect(screen.getByText('Protected View')).toBeTruthy();
  });

  it('AdminRoute redirects non-admin user', () => {
    renderWithState(
      <>
        <AdminRoute path="/admin" component={Protected} />
        <Route path="/signin" component={Signin} />
      </>,
      { userSignin: { userInfo: { isAdmin: false } } },
      ['/admin']
    );
    expect(screen.getByText('Signin View')).toBeTruthy();
  });

  it('SellerRoute allows seller user', () => {
    renderWithState(
      <>
        <SellerRoute path="/seller" component={Protected} />
        <Route path="/signin" component={Signin} />
      </>,
      { userSignin: { userInfo: { isSeller: true } } },
      ['/seller']
    );
    expect(screen.getByText('Protected View')).toBeTruthy();
  });

  it('SellerRoute redirects non-seller user', () => {
    renderWithState(
      <>
        <SellerRoute path="/seller" component={Protected} />
        <Route path="/signin" component={Signin} />
      </>,
      { userSignin: { userInfo: { isSeller: false } } },
      ['/seller']
    );
    expect(screen.getByText('Signin View')).toBeTruthy();
  });
});
