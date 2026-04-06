import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('store', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('window', { __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: undefined });
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => {
        if (key === 'cartItems') return JSON.stringify([{ product: 'p1', qty: 1 }]);
        if (key === 'shippingAddress') return JSON.stringify({ city: 'Taipei' });
        if (key === 'userInfo') return JSON.stringify({ _id: 'u1', name: 'Leo' });
        return null;
      }),
    });
  });

  it('hydrates initial state from localStorage', async () => {
    const { default: store } = await import('./store');
    const state = store.getState();
    expect(state.cart.cartItems.length).toBe(1);
    expect(state.cart.shippingAddress.city).toBe('Taipei');
    expect(state.cart.paymentMethod).toBe('PayPal');
    expect(state.userSignin.userInfo.name).toBe('Leo');
  });
});
