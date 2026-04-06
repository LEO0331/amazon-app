import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../apiClient';
import { addToCart, removeFromCart, savePaymentMethod, saveShippingAddress } from './cartActions';
import {
  CART_ADD_ITEM,
  CART_ADD_ITEM_FAIL,
  CART_REMOVE_ITEM,
  CART_SAVE_PAYMENT_METHOD,
  CART_SAVE_SHIPPING_ADDRESS,
} from '../constants/cartConstants';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const dispatch = vi.fn();

beforeEach(() => {
  dispatch.mockReset();
  apiClient.get.mockReset();
  vi.stubGlobal('localStorage', {
    setItem: vi.fn(),
  });
});

describe('cartActions', () => {
  it('adds item to cart when seller matches existing cart', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: {
        _id: 'p1',
        name: 'Product',
        image: 'img',
        price: 10,
        countInStock: 3,
        seller: { _id: 's1', seller: { name: 'Seller One' } },
      },
    });

    const getState = () => ({
      cart: {
        cartItems: [{ seller: { _id: 's1', seller: { name: 'Seller One' } } }],
      },
    });

    await addToCart('p1', 2)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      type: CART_ADD_ITEM,
      payload: {
        name: 'Product',
        image: 'img',
        price: 10,
        countInStock: 3,
        product: 'p1',
        seller: { _id: 's1', seller: { name: 'Seller One' } },
        qty: 2,
      },
    });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'cartItems',
      JSON.stringify(getState().cart.cartItems)
    );
  });

  it('dispatches add-to-cart fail when seller mismatches', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: {
        _id: 'p2',
        seller: { _id: 's2' },
      },
    });

    const getState = () => ({
      cart: {
        cartItems: [{ seller: { _id: 's1', seller: { name: 'Seller One' } } }],
      },
    });

    await addToCart('p2', 1)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      type: CART_ADD_ITEM_FAIL,
      payload: "Can't Add To Cart. Buy only from Seller One in this order",
    });
  });

  it('dispatches remove, save shipping, and save payment actions', () => {
    const getState = () => ({ cart: { cartItems: [] } });

    removeFromCart('p3')(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith({ type: CART_REMOVE_ITEM, payload: 'p3' });
    expect(localStorage.setItem).toHaveBeenCalledWith('cartItems', JSON.stringify([]));

    dispatch.mockReset();
    saveShippingAddress({ city: 'Taipei' })(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: CART_SAVE_SHIPPING_ADDRESS,
      payload: { city: 'Taipei' },
    });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'shippingAddress',
      JSON.stringify({ city: 'Taipei' })
    );

    dispatch.mockReset();
    savePaymentMethod('PayPal')(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: CART_SAVE_PAYMENT_METHOD,
      payload: 'PayPal',
    });
  });
});
