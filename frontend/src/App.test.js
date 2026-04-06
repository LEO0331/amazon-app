/* @vitest-environment jsdom */
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { initializeCsrfToken } from './apiClient';
import { listProductCategories } from './actions/productActions';
import { signout } from './actions/userActions';

const dispatchMock = vi.fn();
let mockState;

vi.mock('react-redux', () => ({
  useDispatch: () => dispatchMock,
  useSelector: (selector) => selector(mockState),
}));

vi.mock('./apiClient', () => ({
  initializeCsrfToken: vi.fn(),
}));

vi.mock('./actions/productActions', () => ({
  listProductCategories: vi.fn(() => ({ type: 'LIST_PRODUCT_CATEGORIES' })),
}));

vi.mock('./actions/userActions', () => ({
  signout: vi.fn(() => ({ type: 'SIGNOUT' })),
}));

vi.mock('./components/SearchBox', () => ({ default: () => <div>SearchBox</div> }));
vi.mock('./components/ChatBox', () => ({ default: () => <div>ChatBox</div> }));
vi.mock('./components/LoadingBox', () => ({ default: () => <div>Loading...</div> }));
vi.mock('./components/MessageBox', () => ({ default: ({ children }) => <div>{children || 'Message'}</div> }));
vi.mock('./components/PrivateRoute', () => ({ default: () => null }));
vi.mock('./components/AdminRoute', () => ({ default: () => null }));
vi.mock('./components/SellerRoute', () => ({ default: () => null }));

vi.mock('./screens/HomeScreen', () => ({ default: () => <div>Home</div> }));
vi.mock('./screens/ProductScreen', () => ({ default: () => <div>Product</div> }));
vi.mock('./screens/CartScreen', () => ({ default: () => <div>Cart</div> }));
vi.mock('./screens/RegisterScreen', () => ({ default: () => <div>Register</div> }));
vi.mock('./screens/SigninScreen', () => ({ default: () => <div>Signin</div> }));
vi.mock('./screens/ShippingAddressScreen', () => ({ default: () => <div>Shipping</div> }));
vi.mock('./screens/PaymentMethodScreen', () => ({ default: () => <div>Payment</div> }));
vi.mock('./screens/PlaceOrderScreen', () => ({ default: () => <div>PlaceOrder</div> }));
vi.mock('./screens/OrderScreen', () => ({ default: () => <div>Order</div> }));
vi.mock('./screens/OrderHistoryScreen', () => ({ default: () => <div>OrderHistory</div> }));
vi.mock('./screens/ProfileScreen', () => ({ default: () => <div>Profile</div> }));
vi.mock('./screens/ProductListScreen', () => ({ default: () => <div>ProductList</div> }));
vi.mock('./screens/ProductEditScreen', () => ({ default: () => <div>ProductEdit</div> }));
vi.mock('./screens/OrderListScreen', () => ({ default: () => <div>OrderList</div> }));
vi.mock('./screens/UserListScreen', () => ({ default: () => <div>UserList</div> }));
vi.mock('./screens/UserEditScreen', () => ({ default: () => <div>UserEdit</div> }));
vi.mock('./screens/SellerScreen', () => ({ default: () => <div>Seller</div> }));
vi.mock('./screens/SearchScreen', () => ({ default: () => <div>Search</div> }));
vi.mock('./screens/DashboardScreen', () => ({ default: () => <div>Dashboard</div> }));
vi.mock('./screens/SupportScreen', () => ({ default: () => <div>Support</div> }));

function stateFactory(overrides = {}) {
  return {
    cart: { cartItems: [{ product: 'p1' }] },
    userSignin: { userInfo: { name: 'Admin', isAdmin: true, isSeller: true } },
    productCategoryList: { loading: false, error: '', categories: ['Pixel', 'Arcade'] },
    ...overrides,
  };
}

beforeEach(() => {
  dispatchMock.mockReset();
  mockState = stateFactory();
});

afterEach(() => {
  cleanup();
});

describe('App', () => {
  it('dispatches initial category load and csrf init', () => {
    render(<App />);
    expect(listProductCategories).toHaveBeenCalled();
    expect(initializeCsrfToken).toHaveBeenCalled();
  });

  it('opens and closes sidebar and handles category links', () => {
    render(<App />);
    const openBtn = screen.getAllByRole('button', { name: /open categories menu/i })[0];
    fireEvent.click(openBtn);
    expect(screen.getByRole('button', { name: /close sidebar/i })).toBeTruthy();
    fireEvent.click(screen.getByText('Pixel'));
    fireEvent.click(screen.getAllByRole('button', { name: /open categories menu/i })[0]);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.getAllByRole('button', { name: /open categories menu/i })[0]).toBeTruthy();
  });

  it('renders loading and error category states', () => {
    mockState = stateFactory({ productCategoryList: { loading: true, error: '', categories: [] } });
    const { rerender } = render(<App />);
    expect(screen.getByText('Loading...')).toBeTruthy();
    mockState = stateFactory({ productCategoryList: { loading: false, error: 'boom', categories: [] } });
    rerender(<App />);
    expect(screen.getByText('boom')).toBeTruthy();
  });

  it('shows auth nav states and dispatches signout', () => {
    const { rerender } = render(<App />);
    fireEvent.click(screen.getAllByText('Sign Out')[0]);
    expect(signout).toHaveBeenCalled();
    expect(screen.getByText('Dashboard')).toBeTruthy();

    mockState = stateFactory({ userSignin: { userInfo: { name: 'User', isAdmin: false, isSeller: false } } });
    rerender(<App />);
    expect(screen.getByText('ChatBox')).toBeTruthy();

    mockState = stateFactory({ userSignin: { userInfo: null } });
    rerender(<App />);
    expect(screen.getByText('Sign In')).toBeTruthy();
  });
});
