import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../apiClient';
import {
  createOrder,
  deleteOrder,
  deliverOrder,
  detailsOrder,
  listOrderMine,
  listOrders,
  payOrder,
  summaryOrder,
} from './orderActions';
import { CART_EMPTY } from '../constants/cartConstants';
import {
  ORDER_CREATE_FAIL,
  ORDER_CREATE_REQUEST,
  ORDER_CREATE_SUCCESS,
  ORDER_DELETE_FAIL,
  ORDER_DELETE_REQUEST,
  ORDER_DELETE_SUCCESS,
  ORDER_DELIVER_FAIL,
  ORDER_DELIVER_REQUEST,
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
  ORDER_PAY_SUCCESS,
  ORDER_SUMMARY_REQUEST,
  ORDER_SUMMARY_SUCCESS,
} from '../constants/orderConstants';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const dispatch = vi.fn();

function mockError(message) {
  return { response: { data: { message } }, message };
}

beforeEach(() => {
  dispatch.mockReset();
  apiClient.get.mockReset();
  apiClient.post.mockReset();
  apiClient.put.mockReset();
  apiClient.delete.mockReset();
  vi.stubGlobal('localStorage', { removeItem: vi.fn() });
});

describe('orderActions', () => {
  it('dispatches create order success and clears cart storage', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { order: { _id: 'o1' } } });

    await createOrder({ items: [] })(dispatch);

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: ORDER_CREATE_REQUEST,
      payload: { items: [] },
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: ORDER_CREATE_SUCCESS,
      payload: { _id: 'o1' },
    });
    expect(dispatch).toHaveBeenNthCalledWith(3, { type: CART_EMPTY });
    expect(localStorage.removeItem).toHaveBeenCalledWith('cartItems');
  });

  it('dispatches create order failure', async () => {
    apiClient.post.mockRejectedValueOnce(mockError('order failed'));
    await createOrder({})(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: ORDER_CREATE_REQUEST, payload: {} });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: ORDER_CREATE_FAIL,
      payload: 'order failed',
    });
  });

  it('dispatches details/pay success and fail branches', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { _id: 'o1' } });
    await detailsOrder('o1')(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: ORDER_DETAILS_REQUEST, payload: 'o1' });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: ORDER_DETAILS_SUCCESS,
      payload: { _id: 'o1' },
    });

    dispatch.mockReset();
    apiClient.get.mockRejectedValueOnce(mockError('missing order'));
    await detailsOrder('o2')(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: ORDER_DETAILS_REQUEST, payload: 'o2' });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: ORDER_DETAILS_FAIL,
      payload: 'missing order',
    });

    dispatch.mockReset();
    apiClient.put.mockResolvedValueOnce({ data: { message: 'paid' } });
    await payOrder({ _id: 'o1' }, { status: 'ok' })(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: ORDER_PAY_REQUEST,
      payload: { order: { _id: 'o1' }, paymentResult: { status: 'ok' } },
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: ORDER_PAY_SUCCESS,
      payload: { message: 'paid' },
    });

    dispatch.mockReset();
    apiClient.put.mockRejectedValueOnce(mockError('pay failed'));
    await payOrder({ _id: 'o2' }, {})(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: ORDER_PAY_REQUEST,
      payload: { order: { _id: 'o2' }, paymentResult: {} },
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: ORDER_PAY_FAIL,
      payload: 'pay failed',
    });
  });

  it('dispatches list mine/list orders success and fail', async () => {
    apiClient.get.mockResolvedValueOnce({ data: [{ _id: 'o1' }] });
    await listOrderMine()(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: ORDER_MINE_LIST_REQUEST });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: ORDER_MINE_LIST_SUCCESS,
      payload: [{ _id: 'o1' }],
    });

    dispatch.mockReset();
    apiClient.get.mockRejectedValueOnce(mockError('mine failed'));
    await listOrderMine()(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: ORDER_MINE_LIST_REQUEST });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: ORDER_MINE_LIST_FAIL,
      payload: 'mine failed',
    });

    dispatch.mockReset();
    apiClient.get.mockResolvedValueOnce({ data: [] });
    await listOrders({ seller: 's1' })(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: ORDER_LIST_REQUEST });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: ORDER_LIST_SUCCESS,
      payload: [],
    });

    dispatch.mockReset();
    apiClient.get.mockRejectedValueOnce(mockError('list failed'));
    await listOrders({ seller: '' })(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: ORDER_LIST_REQUEST });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: ORDER_LIST_FAIL,
      payload: 'list failed',
    });
  });

  it('dispatches delete/deliver success and fail', async () => {
    apiClient.delete.mockResolvedValueOnce({ data: { message: 'deleted' } });
    await deleteOrder('o1')(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: ORDER_DELETE_REQUEST, payload: 'o1' });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: ORDER_DELETE_SUCCESS,
      payload: { message: 'deleted' },
    });

    dispatch.mockReset();
    apiClient.delete.mockRejectedValueOnce(mockError('delete failed'));
    await deleteOrder('o2')(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: ORDER_DELETE_REQUEST, payload: 'o2' });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: ORDER_DELETE_FAIL,
      payload: 'delete failed',
    });

    dispatch.mockReset();
    apiClient.put.mockResolvedValueOnce({ data: { message: 'delivered' } });
    await deliverOrder('o1')(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: ORDER_DELIVER_REQUEST, payload: 'o1' });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: ORDER_DELIVER_SUCCESS,
      payload: { message: 'delivered' },
    });

    dispatch.mockReset();
    apiClient.put.mockRejectedValueOnce(mockError('deliver failed'));
    await deliverOrder('o2')(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: ORDER_DELIVER_REQUEST, payload: 'o2' });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: ORDER_DELIVER_FAIL,
      payload: 'deliver failed',
    });
  });

  it('dispatches summary success and fallback failure path', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { orders: [] } });
    await summaryOrder()(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: ORDER_SUMMARY_REQUEST });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: ORDER_SUMMARY_SUCCESS,
      payload: { orders: [] },
    });

    dispatch.mockReset();
    apiClient.get.mockRejectedValueOnce(new Error('summary error'));
    await summaryOrder()(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: ORDER_SUMMARY_REQUEST });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: ORDER_CREATE_FAIL,
      payload: 'summary error',
    });
  });
});
