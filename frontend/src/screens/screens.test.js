/* @vitest-environment jsdom */
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import CartScreen from './CartScreen';
import DashboardScreen from './DashboardScreen';
import HomeScreen from './HomeScreen';
import OrderHistoryScreen from './OrderHistoryScreen';
import OrderListScreen from './OrderListScreen';
import OrderScreen from './OrderScreen';
import PaymentMethodScreen from './PaymentMethodScreen';
import PlaceOrderScreen from './PlaceOrderScreen';
import ProductEditScreen from './ProductEditScreen';
import ProductListScreen from './ProductListScreen';
import ProductScreen from './ProductScreen';
import ProfileScreen from './ProfileScreen';
import RegisterScreen from './RegisterScreen';
import SearchScreen from './SearchScreen';
import SellerScreen from './SellerScreen';
import ShippingAddressScreen from './ShippingAddressScreen';
import SigninScreen from './SigninScreen';
import SupportScreen from './SupportScreen';
import UserEditScreen from './UserEditScreen';
import UserListScreen from './UserListScreen';
import apiClient from '../apiClient';
import * as cartActions from '../actions/cartActions';
import * as orderActions from '../actions/orderActions';
import * as productActions from '../actions/productActions';
import * as userActions from '../actions/userActions';

const dispatchMock = vi.fn();
const mockUseParams = vi.fn(() => ({}));
let mockState = {};

vi.mock('react-redux', () => ({
  useDispatch: () => dispatchMock,
  useSelector: (selector) => selector(mockState),
}));

vi.mock('react-router-dom', () => ({
  Link: ({ to, children }) => <a href={typeof to === 'string' ? to : '#'}>{children}</a>,
  useParams: () => mockUseParams(),
}));

vi.mock('react-responsive-carousel/lib/styles/carousel.min.css', () => ({}));
vi.mock('react-responsive-carousel', () => ({
  Carousel: ({ children }) => <div data-testid="carousel">{children}</div>,
}));
vi.mock('react-google-charts', () => ({
  default: () => <div>Chart</div>,
}));
vi.mock('react-modal', () => ({
  default: ({ isOpen, children }) => (isOpen ? <div>{children}</div> : null),
}));
vi.mock('react-paypal-button-v2', () => ({
  PayPalButton: ({ onSuccess }) => (
    <button type="button" onClick={() => onSuccess({ ok: true })}>
      PayPal Mock
    </button>
  ),
}));

vi.mock('../components/LoadingBox', () => ({ default: () => <div>Loading...</div> }));
vi.mock('../components/MessageBox', () => ({ default: ({ children }) => <div>{children || 'Message'}</div> }));
vi.mock('../components/CheckoutSteps', () => ({ default: () => <div>CheckoutSteps</div> }));
vi.mock('../components/Products', () => ({ default: ({ product }) => <div>{product.name}</div> }));
vi.mock('../components/Ratings', () => ({ default: ({ rating }) => <span>Rating-{rating}</span> }));

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../actions/cartActions', () => ({
  addToCart: vi.fn((id, qty) => ({ type: 'ADD_TO_CART', payload: { id, qty } })),
  removeFromCart: vi.fn((id) => ({ type: 'REMOVE_FROM_CART', payload: id })),
  savePaymentMethod: vi.fn((method) => ({ type: 'SAVE_PAYMENT_METHOD', payload: method })),
  saveShippingAddress: vi.fn((address) => ({ type: 'SAVE_SHIPPING_ADDRESS', payload: address })),
}));

vi.mock('../actions/orderActions', () => ({
  createOrder: vi.fn((payload) => ({ type: 'CREATE_ORDER', payload })),
  deleteOrder: vi.fn((id) => ({ type: 'DELETE_ORDER', payload: id })),
  deliverOrder: vi.fn((id) => ({ type: 'DELIVER_ORDER', payload: id })),
  detailsOrder: vi.fn((id) => ({ type: 'DETAILS_ORDER', payload: id })),
  listOrderMine: vi.fn(() => ({ type: 'LIST_ORDER_MINE' })),
  listOrders: vi.fn((payload) => ({ type: 'LIST_ORDERS', payload })),
  payOrder: vi.fn((order, paymentResult) => ({ type: 'PAY_ORDER', payload: { order, paymentResult } })),
  summaryOrder: vi.fn(() => ({ type: 'SUMMARY_ORDER' })),
}));

vi.mock('../actions/productActions', () => ({
  createProduct: vi.fn(() => ({ type: 'CREATE_PRODUCT' })),
  createReview: vi.fn((id, payload) => ({ type: 'CREATE_REVIEW', payload: { id, ...payload } })),
  deleteProduct: vi.fn((id) => ({ type: 'DELETE_PRODUCT', payload: id })),
  detailsProduct: vi.fn((id) => ({ type: 'DETAILS_PRODUCT', payload: id })),
  listProducts: vi.fn((payload) => ({ type: 'LIST_PRODUCTS', payload })),
  updateProduct: vi.fn((payload) => ({ type: 'UPDATE_PRODUCT', payload })),
}));

vi.mock('../actions/userActions', () => ({
  deleteUser: vi.fn((id) => ({ type: 'DELETE_USER', payload: id })),
  detailsUser: vi.fn((id) => ({ type: 'DETAILS_USER', payload: id })),
  listTopSellers: vi.fn(() => ({ type: 'LIST_TOP_SELLERS' })),
  listUsers: vi.fn(() => ({ type: 'LIST_USERS' })),
  register: vi.fn((name, email, password) => ({ type: 'REGISTER', payload: { name, email, password } })),
  signin: vi.fn((email, password) => ({ type: 'SIGNIN', payload: { email, password } })),
  updateUser: vi.fn((payload) => ({ type: 'UPDATE_USER', payload })),
  updateUserProfile: vi.fn((payload) => ({ type: 'UPDATE_USER_PROFILE', payload })),
}));

function baseState() {
  const sellerUser = {
    _id: 'seller1',
    name: 'Seller Name',
    email: 'seller@test.com',
    isAdmin: true,
    isSeller: true,
    seller: { name: 'Store', logo: '/logo.png', description: 'Great store', rating: 4.5, numReviews: 10 },
  };
  const product = {
    _id: 'p1',
    name: 'Pixel Sword',
    image: '/pixel.png',
    category: 'Pixel',
    brand: 'Retro',
    price: 99,
    countInStock: 5,
    description: 'A pixel item',
    rating: 4,
    numReviews: 3,
    seller: { _id: 'seller1', seller: { name: 'Store', rating: 4, numReviews: 8 } },
    reviews: [{ _id: 'r1', name: 'Amy', rating: 4, comment: 'Nice', createdAt: '2026-04-01T00:00:00.000Z' }],
  };
  const order = {
    _id: 'o1',
    shippingAddress: { fullName: 'Leo Li', address: 'A st', city: 'Taipei', postalCode: '100', country: 'TW' },
    paymentMethod: 'PayPal',
    orderItems: [{ product: 'p1', name: 'Pixel Sword', image: '/pixel.png', qty: 2, price: 99 }],
    itemsPrice: 198,
    shippingPrice: 0,
    taxPrice: 29.7,
    totalPrice: 227.7,
    isPaid: true,
    paidAt: '2026-04-01T00:00:00.000Z',
    isDelivered: false,
    createdAt: '2026-04-01T00:00:00.000Z',
    user: { name: 'Leo' },
  };
  return {
    cart: {
      cartItems: [{ product: 'p1', name: 'Pixel Sword', image: '/pixel.png', qty: 1, price: 99, countInStock: 5 }],
      shippingAddress: order.shippingAddress,
      paymentMethod: 'PayPal',
    },
    userSignin: { userInfo: { ...sellerUser } },
    userRegister: { userInfo: null, loading: false, error: '' },
    userDetails: { loading: false, error: '', user: { ...sellerUser } },
    userUpdateProfile: { success: false, error: '', loading: false },
    userList: { loading: false, error: '', users: [sellerUser] },
    userDelete: { loading: false, error: '', success: false },
    userUpdate: { loading: false, error: '', success: false },
    userTopSellersList: { loading: false, error: '', users: [sellerUser] },
    productList: { loading: false, error: '', products: [product], page: 1, pages: 2 },
    productCategoryList: { loading: false, error: '', categories: ['Pixel', 'Gear'] },
    productDetails: { loading: false, error: '', product },
    productCreate: { loading: false, error: '', success: false, product: { _id: 'new1' } },
    productDelete: { loading: false, error: '', success: false },
    productUpdate: { loading: false, error: '', success: false },
    productReviewCreate: { loading: false, error: '', success: false },
    orderCreate: { loading: false, error: '', success: false, order: { _id: 'o1' } },
    orderDetails: { loading: false, error: '', order },
    orderPay: { loading: false, error: '', success: false },
    orderDeliver: { loading: false, error: '', success: false },
    orderList: { loading: false, error: '', orders: [order] },
    orderDelete: { loading: false, error: '', success: false },
    orderMineList: { loading: false, error: '', orders: [order] },
    orderSummary: {
      loading: false,
      error: '',
      summary: {
        users: [{ numUsers: 2 }],
        orders: [{ numOrders: 3, totalSales: 300 }],
        dailyOrders: [{ _id: '2026-04-01', sales: 300 }],
        productCategories: [{ _id: 'Pixel', count: 5 }],
      },
    },
  };
}

function renderScreen(Component, props = {}) {
  return render(<Component {...props} />);
}

beforeEach(() => {
  cleanup();
  dispatchMock.mockReset();
  mockUseParams.mockReset();
  mockUseParams.mockReturnValue({});
  mockState = baseState();
  apiClient.get.mockReset();
  apiClient.post.mockReset();
  window.confirm = vi.fn(() => true);
  window.alert = vi.fn();
  window.paypal = {};
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('screens coverage', () => {
  it('covers auth and checkout flow screens', () => {
    const history = { push: vi.fn() };
    const location = { search: '?redirect=/shipping' };

    renderScreen(SigninScreen, { history, location });
    fireEvent.change(screen.getByPlaceholderText('Enter email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(userActions.signin).toHaveBeenCalledWith('a@b.com', '1234');

    cleanup();
    renderScreen(RegisterScreen, { history, location: { search: '' } });
    fireEvent.change(screen.getByPlaceholderText('Enter name'), { target: { value: 'Leo' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'leo@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '1234' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: '1234' } });
    fireEvent.click(screen.getByText('Register'));
    expect(userActions.register).toHaveBeenCalled();

    cleanup();
    renderScreen(ShippingAddressScreen, { history });
    fireEvent.click(screen.getByText('Continue'));
    expect(cartActions.saveShippingAddress).toHaveBeenCalled();

    cleanup();
    renderScreen(PaymentMethodScreen, { history });
    fireEvent.click(screen.getByText('Continue'));
    expect(cartActions.savePaymentMethod).toHaveBeenCalledWith('PayPal');

    cleanup();
    renderScreen(PlaceOrderScreen, { history });
    fireEvent.click(screen.getByText('Place Order'));
    expect(orderActions.createOrder).toHaveBeenCalled();
  });

  it('covers cart, product, search, seller and home screens', async () => {
    const history = { push: vi.fn() };
    const cartProps = { history, match: { params: { id: 'p1' } }, location: { search: '?qty=2' } };
    renderScreen(CartScreen, cartProps);
    fireEvent.change(screen.getByDisplayValue('1'), { target: { value: '2' } });
    fireEvent.click(screen.getByText('Remove'));
    fireEvent.click(screen.getByText('Proceed to Checkout'));
    expect(cartActions.addToCart).toHaveBeenCalledWith('p1', 2);
    expect(cartActions.removeFromCart).toHaveBeenCalledWith('p1');

    cleanup();
    mockUseParams.mockReturnValue({
      name: 'all',
      category: 'all',
      min: 0,
      max: 0,
      rating: 0,
      order: 'newest',
      pageNumber: 1,
    });
    renderScreen(SearchScreen, { history });
    fireEvent.click(screen.getByText('Hide Filters'));
    expect(productActions.listProducts).toHaveBeenCalled();

    cleanup();
    renderScreen(SellerScreen, { match: { params: { id: 'seller1' } } });
    expect(userActions.detailsUser).toHaveBeenCalledWith('seller1');

    cleanup();
    renderScreen(HomeScreen);
    expect(userActions.listTopSellers).toHaveBeenCalled();
    expect(screen.getByText('Featured Products')).toBeTruthy();

    cleanup();
    renderScreen(ProductScreen, { history, match: { params: { id: 'p1' } } });
    fireEvent.click(screen.getByText('Add To Cart'));
    fireEvent.click(screen.getByText('Report'));
    fireEvent.change(screen.getByLabelText('Rating'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Comment'), { target: { value: 'great' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Submit' }).at(-1));
    await waitFor(() => {
      expect(productActions.createReview).toHaveBeenCalled();
    });
  });

  it('covers order screens and admin lists', async () => {
    const history = { push: vi.fn() };
    renderScreen(OrderHistoryScreen, { history });
    fireEvent.click(screen.getByText('Details'));
    expect(orderActions.listOrderMine).toHaveBeenCalled();

    cleanup();
    renderScreen(OrderListScreen, { history, match: { path: '/orderlist' } });
    fireEvent.click(screen.getByText('Delete'));
    expect(orderActions.deleteOrder).toHaveBeenCalledWith('o1');

    cleanup();
    renderScreen(ProductListScreen, { history, match: { path: '/productlist' } });
    fireEvent.click(screen.getByText('Create Product'));
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Delete'));
    expect(productActions.createProduct).toHaveBeenCalled();
    expect(productActions.deleteProduct).toHaveBeenCalledWith('p1');

    cleanup();
    renderScreen(UserListScreen, { history });
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Delete'));
    expect(userActions.listUsers).toHaveBeenCalled();
    expect(userActions.deleteUser).toHaveBeenCalledWith('seller1');

    cleanup();
    renderScreen(OrderScreen, { history, match: { params: { id: 'o1' } } });
    fireEvent.click(screen.getByText('Deliver Order'));
    expect(orderActions.deliverOrder).toHaveBeenCalledWith('o1');

    cleanup();
    mockState.orderDetails.order = { ...mockState.orderDetails.order, isPaid: false };
    apiClient.get.mockResolvedValue({ data: 'paypal-client' });
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      if (typeof node.onload === 'function') {
        node.onload();
      }
      return node;
    });
    delete window.paypal;
    renderScreen(OrderScreen, { history, match: { params: { id: 'o1' } } });
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/api/config/paypal');
    });
    appendSpy.mockRestore();
  });

  it('covers profile/edit/dashboard/support screens', async () => {
    const history = { push: vi.fn() };
    renderScreen(ProfileScreen);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Updated' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '1234' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: '1234' } });
    fireEvent.click(screen.getByText('Update'));
    expect(userActions.updateUserProfile).toHaveBeenCalled();

    cleanup();
    renderScreen(UserEditScreen, { history, match: { params: { id: 'seller1' } } });
    fireEvent.click(screen.getByText('Update'));
    expect(userActions.updateUser).toHaveBeenCalled();

    cleanup();
    apiClient.post.mockResolvedValue({ data: '/uploaded.png' });
    renderScreen(ProductEditScreen, { history, match: { params: { id: 'p1' } } });
    fireEvent.change(screen.getByLabelText('Image File'), { target: { files: [new File(['x'], 'x.png')] } });
    await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
    fireEvent.click(screen.getByText('Update'));
    expect(productActions.updateProduct).toHaveBeenCalled();

    cleanup();
    renderScreen(DashboardScreen);
    expect(orderActions.summaryOrder).toHaveBeenCalled();
    expect(screen.getByText('Dashboard')).toBeTruthy();

    cleanup();
    vi.useFakeTimers();
    apiClient.get
      .mockResolvedValueOnce({ data: [{ _id: 't1', user: { name: 'Customer 1' } }] })
      .mockResolvedValueOnce({ data: [{ _id: 'm1', name: 'Admin', body: 'Hi' }] })
      .mockResolvedValue({ data: [{ _id: 'm2', name: 'Customer 1', body: 'Hello' }] });
    apiClient.post.mockResolvedValueOnce({ data: { ok: true } });
    renderScreen(SupportScreen);
    await waitFor(() => expect(screen.getByText('Customer 1')).toBeTruthy());
    fireEvent.change(screen.getByPlaceholderText('Please type message'), { target: { value: 'Reply' } });
    fireEvent.click(screen.getByText('Send'));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
  });
});
