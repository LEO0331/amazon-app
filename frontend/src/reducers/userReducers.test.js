import { describe, expect, it } from 'vitest';
import {
  userDeleteReducer,
  userDetailsReducer,
  userListReducer,
  userRegisterReducer,
  userSigninReducer,
  userTopSellerListReducer,
  userUpdateProfileReducer,
  userUpdateReducer,
} from './userReducers';
import {
  USER_DELETE_FAIL,
  USER_DELETE_REQUEST,
  USER_DELETE_RESET,
  USER_DELETE_SUCCESS,
  USER_DETAILS_FAIL,
  USER_DETAILS_REQUEST,
  USER_DETAILS_RESET,
  USER_DETAILS_SUCCESS,
  USER_LIST_FAIL,
  USER_LIST_REQUEST,
  USER_LIST_SUCCESS,
  USER_REGISTER_FAIL,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_SIGNIN_FAIL,
  USER_SIGNIN_REQUEST,
  USER_SIGNIN_SUCCESS,
  USER_SIGNOUT,
  USER_TOPSELLERS_LIST_FAIL,
  USER_TOPSELLERS_LIST_REQUEST,
  USER_TOPSELLERS_LIST_SUCCESS,
  USER_UPDATE_FAIL,
  USER_UPDATE_PROFILE_FAIL,
  USER_UPDATE_PROFILE_REQUEST,
  USER_UPDATE_PROFILE_RESET,
  USER_UPDATE_PROFILE_SUCCESS,
  USER_UPDATE_REQUEST,
  USER_UPDATE_RESET,
  USER_UPDATE_SUCCESS,
} from '../constants/userConstants';

describe('user reducers', () => {
  it('userRegisterReducer handles all branches', () => {
    expect(userRegisterReducer(undefined, { type: USER_REGISTER_REQUEST })).toEqual({ loading: true });
    expect(userRegisterReducer(undefined, { type: USER_REGISTER_SUCCESS, payload: { _id: 'u1' } })).toEqual({
      loading: false,
      userInfo: { _id: 'u1' },
    });
    expect(userRegisterReducer(undefined, { type: USER_REGISTER_FAIL, payload: 'register failed' })).toEqual({
      loading: false,
      error: 'register failed',
    });
    expect(userRegisterReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('userSigninReducer handles all branches', () => {
    expect(userSigninReducer(undefined, { type: USER_SIGNIN_REQUEST })).toEqual({ loading: true });
    expect(userSigninReducer(undefined, { type: USER_SIGNIN_SUCCESS, payload: { _id: 'u2' } })).toEqual({
      loading: false,
      userInfo: { _id: 'u2' },
    });
    expect(userSigninReducer(undefined, { type: USER_SIGNIN_FAIL, payload: 'signin failed' })).toEqual({
      loading: false,
      error: 'signin failed',
    });
    expect(userSigninReducer({ userInfo: { _id: 'u2' } }, { type: USER_SIGNOUT })).toEqual({});
    expect(userSigninReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('userDetailsReducer handles all branches', () => {
    expect(userDetailsReducer(undefined, { type: USER_DETAILS_REQUEST })).toEqual({ loading: true });
    expect(userDetailsReducer(undefined, { type: USER_DETAILS_SUCCESS, payload: { _id: 'u3' } })).toEqual({
      loading: false,
      user: { _id: 'u3' },
    });
    expect(userDetailsReducer(undefined, { type: USER_DETAILS_FAIL, payload: 'details failed' })).toEqual({
      loading: false,
      error: 'details failed',
    });
    expect(userDetailsReducer({ loading: false, user: { _id: 'u3' } }, { type: USER_DETAILS_RESET })).toEqual({
      loading: true,
    });
    expect(userDetailsReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('userUpdateProfileReducer handles all branches', () => {
    expect(userUpdateProfileReducer(undefined, { type: USER_UPDATE_PROFILE_REQUEST })).toEqual({ loading: true });
    expect(userUpdateProfileReducer(undefined, { type: USER_UPDATE_PROFILE_SUCCESS })).toEqual({
      loading: false,
      success: true,
    });
    expect(userUpdateProfileReducer(undefined, { type: USER_UPDATE_PROFILE_FAIL, payload: 'update profile failed' })).toEqual({
      loading: false,
      error: 'update profile failed',
    });
    expect(userUpdateProfileReducer({ success: true }, { type: USER_UPDATE_PROFILE_RESET })).toEqual({});
    expect(userUpdateProfileReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('userUpdateReducer handles all branches', () => {
    expect(userUpdateReducer(undefined, { type: USER_UPDATE_REQUEST })).toEqual({ loading: true });
    expect(userUpdateReducer(undefined, { type: USER_UPDATE_SUCCESS })).toEqual({ loading: false, success: true });
    expect(userUpdateReducer(undefined, { type: USER_UPDATE_FAIL, payload: 'update failed' })).toEqual({
      loading: false,
      error: 'update failed',
    });
    expect(userUpdateReducer({ success: true }, { type: USER_UPDATE_RESET })).toEqual({});
    expect(userUpdateReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('userListReducer handles all branches', () => {
    expect(userListReducer(undefined, { type: USER_LIST_REQUEST })).toEqual({ loading: true });
    expect(userListReducer(undefined, { type: USER_LIST_SUCCESS, payload: [{ _id: 'u4' }] })).toEqual({
      loading: false,
      users: [{ _id: 'u4' }],
    });
    expect(userListReducer(undefined, { type: USER_LIST_FAIL, payload: 'list failed' })).toEqual({
      loading: false,
      error: 'list failed',
    });
    expect(userListReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('userDeleteReducer handles all branches', () => {
    expect(userDeleteReducer(undefined, { type: USER_DELETE_REQUEST })).toEqual({ loading: true });
    expect(userDeleteReducer(undefined, { type: USER_DELETE_SUCCESS })).toEqual({ loading: false, success: true });
    expect(userDeleteReducer(undefined, { type: USER_DELETE_FAIL, payload: 'delete failed' })).toEqual({
      loading: false,
      error: 'delete failed',
    });
    expect(userDeleteReducer({ success: true }, { type: USER_DELETE_RESET })).toEqual({});
    expect(userDeleteReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });

  it('userTopSellerListReducer handles all branches', () => {
    expect(userTopSellerListReducer(undefined, { type: USER_TOPSELLERS_LIST_REQUEST })).toEqual({ loading: true });
    expect(userTopSellerListReducer(undefined, { type: USER_TOPSELLERS_LIST_SUCCESS, payload: [{ _id: 'u5' }] })).toEqual({
      loading: false,
      users: [{ _id: 'u5' }],
    });
    expect(userTopSellerListReducer(undefined, { type: USER_TOPSELLERS_LIST_FAIL, payload: 'top sellers failed' })).toEqual({
      loading: false,
      error: 'top sellers failed',
    });
    expect(userTopSellerListReducer({ keep: true }, { type: 'UNKNOWN' })).toEqual({ keep: true });
  });
});
