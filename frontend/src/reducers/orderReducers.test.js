import { describe, expect, it } from 'vitest';
import {
  orderCreateReducer,
  orderDetailsReducer,
  orderSummaryReducer,
} from './orderReducers';
import {
  ORDER_CREATE_REQUEST,
  ORDER_CREATE_SUCCESS,
  ORDER_CREATE_FAIL,
  ORDER_DETAILS_SUCCESS,
  ORDER_SUMMARY_SUCCESS,
  ORDER_SUMMARY_FAIL,
} from '../constants/orderConstants';

describe('order reducers', () => {
  it('handles order create lifecycle', () => {
    const loading = orderCreateReducer({}, { type: ORDER_CREATE_REQUEST });
    expect(loading).toEqual({ loading: true });

    const success = orderCreateReducer(loading, {
      type: ORDER_CREATE_SUCCESS,
      payload: { _id: 'o1', totalPrice: 120 },
    });
    expect(success).toEqual({ loading: false, success: true, order: { _id: 'o1', totalPrice: 120 } });

    const fail = orderCreateReducer({}, { type: ORDER_CREATE_FAIL, payload: 'Create failed' });
    expect(fail).toEqual({ loading: false, error: 'Create failed' });
  });

  it('stores loaded order details', () => {
    const state = orderDetailsReducer(undefined, {
      type: ORDER_DETAILS_SUCCESS,
      payload: { _id: 'o2', isPaid: true },
    });
    expect(state).toEqual({ loading: false, order: { _id: 'o2', isPaid: true } });
  });

  it('handles summary success and failure', () => {
    const success = orderSummaryReducer(undefined, {
      type: ORDER_SUMMARY_SUCCESS,
      payload: { orders: [{ numOrders: 5 }] },
    });
    expect(success).toEqual({ loading: false, summary: { orders: [{ numOrders: 5 }] } });

    const fail = orderSummaryReducer(undefined, {
      type: ORDER_SUMMARY_FAIL,
      payload: 'Summary failed',
    });
    expect(fail).toEqual({ loading: false, error: 'Summary failed' });
  });
});
