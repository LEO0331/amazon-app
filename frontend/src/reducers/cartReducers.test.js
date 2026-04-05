import { describe, expect, it } from 'vitest';
import { cartReducer } from './cartReducers';
import {
  CART_ADD_ITEM,
  CART_EMPTY,
  CART_REMOVE_ITEM,
  CART_SAVE_PAYMENT_METHOD,
  CART_SAVE_SHIPPING_ADDRESS,
} from '../constants/cartConstants';

describe('cartReducer', () => {
  it('adds and updates cart item quantity by product id', () => {
    const first = cartReducer(undefined, {
      type: CART_ADD_ITEM,
      payload: { product: 'p1', qty: 1, name: 'Item 1' },
    });
    const second = cartReducer(first, {
      type: CART_ADD_ITEM,
      payload: { product: 'p1', qty: 3, name: 'Item 1' },
    });

    expect(second.cartItems).toHaveLength(1);
    expect(second.cartItems[0].qty).toBe(3);
  });

  it('removes item and clears cart', () => {
    const withItem = cartReducer(undefined, {
      type: CART_ADD_ITEM,
      payload: { product: 'p2', qty: 2, name: 'Item 2' },
    });

    const removed = cartReducer(withItem, {
      type: CART_REMOVE_ITEM,
      payload: 'p2',
    });

    expect(removed.cartItems).toHaveLength(0);

    const cleared = cartReducer(withItem, { type: CART_EMPTY });
    expect(cleared.cartItems).toHaveLength(0);
  });

  it('stores shipping address and payment method', () => {
    const withAddress = cartReducer(undefined, {
      type: CART_SAVE_SHIPPING_ADDRESS,
      payload: { city: 'Taipei', country: 'Taiwan' },
    });

    const withPayment = cartReducer(withAddress, {
      type: CART_SAVE_PAYMENT_METHOD,
      payload: 'PayPal',
    });

    expect(withPayment.shippingAddress.city).toBe('Taipei');
    expect(withPayment.paymentMethod).toBe('PayPal');
  });
});
