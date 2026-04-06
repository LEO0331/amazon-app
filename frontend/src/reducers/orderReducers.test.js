import { describe, expect, it } from 'vitest';
import {
  orderCreateReducer,
  orderDeleteReducer,
  orderDeliverReducer,
  orderDetailsReducer,
  orderListReducer,
  orderMineListReducer,
  orderPayReducer,
  orderSummaryReducer,
} from './orderReducers';
import {
  ORDER_CREATE_FAIL,
  ORDER_CREATE_REQUEST,
  ORDER_CREATE_RESET,
  ORDER_CREATE_SUCCESS,
  ORDER_DELETE_FAIL,
  ORDER_DELETE_REQUEST,
  ORDER_DELETE_RESET,
  ORDER_DELETE_SUCCESS,
  ORDER_DELIVER_FAIL,
  ORDER_DELIVER_REQUEST,
  ORDER_DELIVER_RESET,
  ORDER_DELIVER_SUCCESS,
  ORDER_DETAILS_FAIL,
  ORDER_DETAILS_REQUEST,
  ORDER_DETAILS_SUCCESS,
  ORDER_LIST_FAIL,
  ORDER_LIST_REQUEST,
  ORDER_LIST_SUCCESS,
  ORDER_MINE_LIST_FAIL,
  ORDER_MINE_LIST_REQUEST,
  ORDER_MINE_LIST_SUCCESS,
  ORDER_PAY_FAIL,
  ORDER_PAY_REQUEST,
  ORDER_PAY_RESET,
  ORDER_PAY_SUCCESS,
  ORDER_SUMMARY_FAIL,
  ORDER_SUMMARY_REQUEST,
  ORDER_SUMMARY_SUCCESS,
} from '../constants/orderConstants';

describe('order reducers', () => {
  it('orderCreateReducer handles all branches', () => {
    expect(orderCreateReducer(undefined, { type: ORDER_CREATE_REQUEST })).toEqual({ loading: true });
    expect(orderCreateReducer({}, { type: ORDER_CREATE_SUCCESS, payload: { _id: 'o1' } })).toEqual({
      loading: false,
      success: true,
      order: { _id: 'o1' },
    });
    expect(orderCreateReducer({}, { type: ORDER_CREATE_FAIL, payload: 'create failed' })).toEqual({
      loading: false,
      error: 'create failed',
    });
    expect(orderCreateReducer({ loading: false, success: true }, { type: ORDER_CREATE_RESET })).toEqual({});
    expect(orderCreateReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('orderDetailsReducer handles request/success/fail/default', () => {
    expect(orderDetailsReducer(undefined, { type: ORDER_DETAILS_REQUEST })).toEqual({ loading: true });
    expect(orderDetailsReducer(undefined, { type: ORDER_DETAILS_SUCCESS, payload: { _id: 'o2' } })).toEqual({
      loading: false,
      order: { _id: 'o2' },
    });
    expect(orderDetailsReducer(undefined, { type: ORDER_DETAILS_FAIL, payload: 'detail failed' })).toEqual({
      loading: false,
      error: 'detail failed',
    });
    expect(orderDetailsReducer({ hold: true }, { type: 'UNKNOWN' })).toEqual({ hold: true });
  });

  it('orderPayReducer handles all branches', () => {
    expect(orderPayReducer(undefined, { type: ORDER_PAY_REQUEST })).toEqual({ loading: true });
    expect(orderPayReducer({}, { type: ORDER_PAY_SUCCESS })).toEqual({ loading: false, success: true });
    expect(orderPayReducer({}, { type: ORDER_PAY_FAIL, payload: 'pay failed' })).toEqual({
      loading: false,
      error: 'pay failed',
    });
    expect(orderPayReducer({ success: true }, { type: ORDER_PAY_RESET })).toEqual({});
    expect(orderPayReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('orderMineListReducer handles request/success/fail/default', () => {
    expect(orderMineListReducer(undefined, { type: ORDER_MINE_LIST_REQUEST })).toEqual({ loading: true });
    expect(orderMineListReducer(undefined, { type: ORDER_MINE_LIST_SUCCESS, payload: [{ _id: 'o3' }] })).toEqual({
      loading: false,
      orders: [{ _id: 'o3' }],
    });
    expect(orderMineListReducer(undefined, { type: ORDER_MINE_LIST_FAIL, payload: 'mine failed' })).toEqual({
      loading: false,
      error: 'mine failed',
    });
    expect(orderMineListReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('orderListReducer handles request/success/fail/default', () => {
    expect(orderListReducer(undefined, { type: ORDER_LIST_REQUEST })).toEqual({ loading: true });
    expect(orderListReducer(undefined, { type: ORDER_LIST_SUCCESS, payload: [{ _id: 'o4' }] })).toEqual({
      loading: false,
      orders: [{ _id: 'o4' }],
    });
    expect(orderListReducer(undefined, { type: ORDER_LIST_FAIL, payload: 'list failed' })).toEqual({
      loading: false,
      error: 'list failed',
    });
    expect(orderListReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('orderDeleteReducer handles all branches', () => {
    expect(orderDeleteReducer(undefined, { type: ORDER_DELETE_REQUEST })).toEqual({ loading: true });
    expect(orderDeleteReducer({}, { type: ORDER_DELETE_SUCCESS })).toEqual({ loading: false, success: true });
    expect(orderDeleteReducer({}, { type: ORDER_DELETE_FAIL, payload: 'delete failed' })).toEqual({
      loading: false,
      error: 'delete failed',
    });
    expect(orderDeleteReducer({ success: true }, { type: ORDER_DELETE_RESET })).toEqual({});
    expect(orderDeleteReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('orderDeliverReducer handles all branches', () => {
    expect(orderDeliverReducer(undefined, { type: ORDER_DELIVER_REQUEST })).toEqual({ loading: true });
    expect(orderDeliverReducer({}, { type: ORDER_DELIVER_SUCCESS })).toEqual({ loading: false, success: true });
    expect(orderDeliverReducer({}, { type: ORDER_DELIVER_FAIL, payload: 'deliver failed' })).toEqual({
      loading: false,
      error: 'deliver failed',
    });
    expect(orderDeliverReducer({ success: true }, { type: ORDER_DELIVER_RESET })).toEqual({});
    expect(orderDeliverReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('orderSummaryReducer handles request/success/fail/default', () => {
    expect(orderSummaryReducer(undefined, { type: ORDER_SUMMARY_REQUEST })).toEqual({ loading: true });
    expect(orderSummaryReducer(undefined, { type: ORDER_SUMMARY_SUCCESS, payload: { orders: [] } })).toEqual({
      loading: false,
      summary: { orders: [] },
    });
    expect(orderSummaryReducer(undefined, { type: ORDER_SUMMARY_FAIL, payload: 'summary failed' })).toEqual({
      loading: false,
      error: 'summary failed',
    });
    expect(orderSummaryReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });
});
