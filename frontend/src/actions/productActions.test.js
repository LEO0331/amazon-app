import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../apiClient';
import {
  createProduct,
  createReview,
  deleteProduct,
  detailsProduct,
  listProductCategories,
  listProducts,
  updateProduct,
} from './productActions';
import {
  PRODUCT_CATEGORY_LIST_FAIL,
  PRODUCT_CATEGORY_LIST_REQUEST,
  PRODUCT_CATEGORY_LIST_SUCCESS,
  PRODUCT_CREATE_FAIL,
  PRODUCT_CREATE_REQUEST,
  PRODUCT_CREATE_SUCCESS,
  PRODUCT_DELETE_FAIL,
  PRODUCT_DELETE_REQUEST,
  PRODUCT_DELETE_SUCCESS,
  PRODUCT_DETAILS_FAIL,
  PRODUCT_DETAILS_REQUEST,
  PRODUCT_DETAILS_SUCCESS,
  PRODUCT_LIST_FAIL,
  PRODUCT_LIST_REQUEST,
  PRODUCT_LIST_SUCCESS,
  PRODUCT_REVIEW_CREATE_FAIL,
  PRODUCT_REVIEW_CREATE_REQUEST,
  PRODUCT_REVIEW_CREATE_SUCCESS,
  PRODUCT_UPDATE_FAIL,
  PRODUCT_UPDATE_REQUEST,
  PRODUCT_UPDATE_SUCCESS,
} from '../constants/productConstants';

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
});

describe('productActions', () => {
  it('dispatches list products success', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { products: [] } });

    await listProducts({ pageNumber: 1 })(dispatch);

    expect(dispatch).toHaveBeenNthCalledWith(1, { type: PRODUCT_LIST_REQUEST });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: PRODUCT_LIST_SUCCESS,
      payload: { products: [] },
    });
  });

  it('dispatches list products fail', async () => {
    apiClient.get.mockRejectedValueOnce(new Error('network error'));

    await listProducts({})(dispatch);

    expect(dispatch).toHaveBeenNthCalledWith(1, { type: PRODUCT_LIST_REQUEST });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: PRODUCT_LIST_FAIL,
      payload: 'network error',
    });
  });

  it('dispatches category list success/fail', async () => {
    apiClient.get.mockResolvedValueOnce({ data: ['Shoes'] });
    await listProductCategories()(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: PRODUCT_CATEGORY_LIST_REQUEST });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: PRODUCT_CATEGORY_LIST_SUCCESS,
      payload: ['Shoes'],
    });

    dispatch.mockReset();
    apiClient.get.mockRejectedValueOnce(new Error('category failed'));
    await listProductCategories()(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: PRODUCT_CATEGORY_LIST_REQUEST });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: PRODUCT_CATEGORY_LIST_FAIL,
      payload: 'category failed',
    });
  });

  it('dispatches product details fail with backend message', async () => {
    apiClient.get.mockRejectedValueOnce(mockError('Product Not Found'));

    await detailsProduct('p1')(dispatch);

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: PRODUCT_DETAILS_REQUEST,
      payload: 'p1',
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: PRODUCT_DETAILS_FAIL,
      payload: 'Product Not Found',
    });
  });

  it('dispatches create/update/delete product success and review fail', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { product: { _id: 'new-product' } } });
    await createProduct()(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: PRODUCT_CREATE_REQUEST });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: PRODUCT_CREATE_SUCCESS,
      payload: { _id: 'new-product' },
    });

    dispatch.mockReset();
    apiClient.put.mockResolvedValueOnce({ data: { message: 'updated' } });
    await updateProduct({ _id: 'p1', name: 'x' })(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: PRODUCT_UPDATE_REQUEST,
      payload: { _id: 'p1', name: 'x' },
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: PRODUCT_UPDATE_SUCCESS,
      payload: { message: 'updated' },
    });

    dispatch.mockReset();
    apiClient.delete.mockResolvedValueOnce({ data: { message: 'deleted' } });
    await deleteProduct('p1')(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: PRODUCT_DELETE_REQUEST,
      payload: 'p1',
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, { type: PRODUCT_DELETE_SUCCESS });

    dispatch.mockReset();
    apiClient.post.mockRejectedValueOnce(mockError('review failed'));
    await createReview('p1', { rating: 4, comment: 'ok' })(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: PRODUCT_REVIEW_CREATE_REQUEST });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: PRODUCT_REVIEW_CREATE_FAIL,
      payload: 'review failed',
    });
  });

  it('dispatches create/update/delete/details fail fallback to generic message', async () => {
    apiClient.post.mockRejectedValueOnce(new Error('create failed'));
    await createProduct()(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: PRODUCT_CREATE_REQUEST });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: PRODUCT_CREATE_FAIL,
      payload: 'create failed',
    });

    dispatch.mockReset();
    apiClient.put.mockRejectedValueOnce(new Error('update failed'));
    await updateProduct({ _id: 'p2' })(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: PRODUCT_UPDATE_REQUEST,
      payload: { _id: 'p2' },
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: PRODUCT_UPDATE_FAIL,
      payload: 'update failed',
    });

    dispatch.mockReset();
    apiClient.delete.mockRejectedValueOnce(new Error('delete failed'));
    await deleteProduct('p2')(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: PRODUCT_DELETE_REQUEST,
      payload: 'p2',
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: PRODUCT_DELETE_FAIL,
      payload: 'delete failed',
    });

    dispatch.mockReset();
    apiClient.get.mockResolvedValueOnce({ data: { _id: 'p2' } });
    await detailsProduct('p2')(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: PRODUCT_DETAILS_REQUEST,
      payload: 'p2',
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: PRODUCT_DETAILS_SUCCESS,
      payload: { _id: 'p2' },
    });

    dispatch.mockReset();
    apiClient.post.mockResolvedValueOnce({ data: { product: { _id: 'p2' } } });
    await createReview('p2', { rating: 5, comment: 'great' })(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: PRODUCT_REVIEW_CREATE_REQUEST });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: PRODUCT_REVIEW_CREATE_SUCCESS,
      payload: { _id: 'p2' },
    });
  });
});
