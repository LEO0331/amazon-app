import { describe, expect, it } from 'vitest';
import {
  productListReducer,
  productDetailsReducer,
  productCreateReducer,
  productUpdateReducer,
  productDeleteReducer,
  productCategoryListReducer,
  productReviewCreateReducer,
} from './productReducers';
import {
  PRODUCT_LIST_SUCCESS,
  PRODUCT_DETAILS_SUCCESS,
  PRODUCT_CREATE_SUCCESS,
  PRODUCT_CREATE_RESET,
  PRODUCT_UPDATE_FAIL,
  PRODUCT_DELETE_SUCCESS,
  PRODUCT_CATEGORY_LIST_SUCCESS,
  PRODUCT_REVIEW_CREATE_REQUEST,
  PRODUCT_REVIEW_CREATE_RESET,
} from '../constants/productConstants';

describe('product reducers', () => {
  it('handles product list success payload', () => {
    const state = productListReducer(undefined, {
      type: PRODUCT_LIST_SUCCESS,
      payload: { products: [{ _id: 'p1' }], page: 1, pages: 3 },
    });
    expect(state).toEqual({ loading: false, products: [{ _id: 'p1' }], page: 1, pages: 3 });
  });

  it('handles product details success', () => {
    const state = productDetailsReducer(undefined, {
      type: PRODUCT_DETAILS_SUCCESS,
      payload: { _id: 'p2', name: 'Pixel Sword' },
    });
    expect(state).toEqual({ loading: false, product: { _id: 'p2', name: 'Pixel Sword' } });
  });

  it('handles create reducer success and reset', () => {
    const success = productCreateReducer(undefined, {
      type: PRODUCT_CREATE_SUCCESS,
      payload: { _id: 'p3' },
    });
    expect(success).toEqual({ loading: false, success: true, product: { _id: 'p3' } });

    const reset = productCreateReducer(success, { type: PRODUCT_CREATE_RESET });
    expect(reset).toEqual({});
  });

  it('handles update reducer fail path', () => {
    const state = productUpdateReducer(undefined, {
      type: PRODUCT_UPDATE_FAIL,
      payload: 'Update failed',
    });
    expect(state).toEqual({ loading: false, error: 'Update failed' });
  });

  it('handles delete/category/review reducers', () => {
    const deleted = productDeleteReducer(undefined, { type: PRODUCT_DELETE_SUCCESS });
    expect(deleted).toEqual({ loading: false, success: true });

    const categories = productCategoryListReducer(undefined, {
      type: PRODUCT_CATEGORY_LIST_SUCCESS,
      payload: ['Accessories', 'Shoes'],
    });
    expect(categories).toEqual({ loading: false, categories: ['Accessories', 'Shoes'] });

    const reviewing = productReviewCreateReducer(undefined, { type: PRODUCT_REVIEW_CREATE_REQUEST });
    expect(reviewing).toEqual({ loading: true });

    const reviewReset = productReviewCreateReducer(reviewing, { type: PRODUCT_REVIEW_CREATE_RESET });
    expect(reviewReset).toEqual({});
  });
});
