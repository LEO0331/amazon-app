import { describe, expect, it } from 'vitest';
import {
  productCategoryListReducer,
  productCreateReducer,
  productDeleteReducer,
  productDetailsReducer,
  productListReducer,
  productReviewCreateReducer,
  productUpdateReducer,
} from './productReducers';
import {
  PRODUCT_CATEGORY_LIST_FAIL,
  PRODUCT_CATEGORY_LIST_REQUEST,
  PRODUCT_CATEGORY_LIST_SUCCESS,
  PRODUCT_CREATE_FAIL,
  PRODUCT_CREATE_REQUEST,
  PRODUCT_CREATE_RESET,
  PRODUCT_CREATE_SUCCESS,
  PRODUCT_DELETE_FAIL,
  PRODUCT_DELETE_REQUEST,
  PRODUCT_DELETE_RESET,
  PRODUCT_DELETE_SUCCESS,
  PRODUCT_DETAILS_FAIL,
  PRODUCT_DETAILS_REQUEST,
  PRODUCT_DETAILS_SUCCESS,
  PRODUCT_LIST_FAIL,
  PRODUCT_LIST_REQUEST,
  PRODUCT_LIST_SUCCESS,
  PRODUCT_REVIEW_CREATE_FAIL,
  PRODUCT_REVIEW_CREATE_REQUEST,
  PRODUCT_REVIEW_CREATE_RESET,
  PRODUCT_REVIEW_CREATE_SUCCESS,
  PRODUCT_UPDATE_FAIL,
  PRODUCT_UPDATE_REQUEST,
  PRODUCT_UPDATE_RESET,
  PRODUCT_UPDATE_SUCCESS,
} from '../constants/productConstants';

describe('product reducers', () => {
  it('productListReducer handles request/success/fail/default', () => {
    expect(productListReducer(undefined, { type: PRODUCT_LIST_REQUEST })).toEqual({ loading: true });
    expect(
      productListReducer(undefined, {
        type: PRODUCT_LIST_SUCCESS,
        payload: { products: [{ _id: 'p1' }], page: 2, pages: 7 },
      })
    ).toEqual({ loading: false, products: [{ _id: 'p1' }], page: 2, pages: 7 });
    expect(productListReducer(undefined, { type: PRODUCT_LIST_FAIL, payload: 'list failed' })).toEqual({
      loading: false,
      error: 'list failed',
    });
    expect(productListReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('productDetailsReducer handles request/success/fail/default', () => {
    expect(productDetailsReducer(undefined, { type: PRODUCT_DETAILS_REQUEST })).toEqual({ loading: true });
    expect(
      productDetailsReducer(undefined, { type: PRODUCT_DETAILS_SUCCESS, payload: { _id: 'p2', name: 'Pixel' } })
    ).toEqual({ loading: false, product: { _id: 'p2', name: 'Pixel' } });
    expect(productDetailsReducer(undefined, { type: PRODUCT_DETAILS_FAIL, payload: 'details failed' })).toEqual({
      loading: false,
      error: 'details failed',
    });
    expect(productDetailsReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('productCreateReducer handles all branches', () => {
    expect(productCreateReducer(undefined, { type: PRODUCT_CREATE_REQUEST })).toEqual({ loading: true });
    expect(productCreateReducer(undefined, { type: PRODUCT_CREATE_SUCCESS, payload: { _id: 'p3' } })).toEqual({
      loading: false,
      success: true,
      product: { _id: 'p3' },
    });
    expect(productCreateReducer(undefined, { type: PRODUCT_CREATE_FAIL, payload: 'create failed' })).toEqual({
      loading: false,
      error: 'create failed',
    });
    expect(productCreateReducer({ success: true }, { type: PRODUCT_CREATE_RESET })).toEqual({});
    expect(productCreateReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('productUpdateReducer handles all branches', () => {
    expect(productUpdateReducer(undefined, { type: PRODUCT_UPDATE_REQUEST })).toEqual({ loading: true });
    expect(productUpdateReducer(undefined, { type: PRODUCT_UPDATE_SUCCESS, payload: { _id: 'p4' } })).toEqual({
      loading: false,
      success: true,
      product: { _id: 'p4' },
    });
    expect(productUpdateReducer(undefined, { type: PRODUCT_UPDATE_FAIL, payload: 'update failed' })).toEqual({
      loading: false,
      error: 'update failed',
    });
    expect(productUpdateReducer({ success: true }, { type: PRODUCT_UPDATE_RESET })).toEqual({});
    expect(productUpdateReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('productDeleteReducer handles all branches', () => {
    expect(productDeleteReducer(undefined, { type: PRODUCT_DELETE_REQUEST })).toEqual({ loading: true });
    expect(productDeleteReducer(undefined, { type: PRODUCT_DELETE_SUCCESS })).toEqual({
      loading: false,
      success: true,
    });
    expect(productDeleteReducer(undefined, { type: PRODUCT_DELETE_FAIL, payload: 'delete failed' })).toEqual({
      loading: false,
      error: 'delete failed',
    });
    expect(productDeleteReducer({ success: true }, { type: PRODUCT_DELETE_RESET })).toEqual({});
    expect(productDeleteReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('productCategoryListReducer handles all branches', () => {
    expect(productCategoryListReducer(undefined, { type: PRODUCT_CATEGORY_LIST_REQUEST })).toEqual({ loading: true });
    expect(
      productCategoryListReducer(undefined, {
        type: PRODUCT_CATEGORY_LIST_SUCCESS,
        payload: ['Accessories', 'Shoes'],
      })
    ).toEqual({ loading: false, categories: ['Accessories', 'Shoes'] });
    expect(
      productCategoryListReducer(undefined, { type: PRODUCT_CATEGORY_LIST_FAIL, payload: 'category failed' })
    ).toEqual({ loading: false, error: 'category failed' });
    expect(productCategoryListReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('productReviewCreateReducer handles all branches', () => {
    expect(productReviewCreateReducer(undefined, { type: PRODUCT_REVIEW_CREATE_REQUEST })).toEqual({ loading: true });
    expect(
      productReviewCreateReducer(undefined, {
        type: PRODUCT_REVIEW_CREATE_SUCCESS,
        payload: { rating: 5, comment: 'Great' },
      })
    ).toEqual({ loading: false, success: true, review: { rating: 5, comment: 'Great' } });
    expect(
      productReviewCreateReducer(undefined, {
        type: PRODUCT_REVIEW_CREATE_FAIL,
        payload: 'review failed',
      })
    ).toEqual({ loading: false, error: 'review failed' });
    expect(productReviewCreateReducer({ success: true }, { type: PRODUCT_REVIEW_CREATE_RESET })).toEqual({});
    expect(productReviewCreateReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });
});
