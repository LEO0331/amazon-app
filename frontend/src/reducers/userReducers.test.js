import { describe, expect, it } from 'vitest';
import {
  userSigninReducer,
  userRegisterReducer,
  userUpdateProfileReducer,
} from './userReducers';
import {
  USER_SIGNIN_REQUEST,
  USER_SIGNIN_SUCCESS,
  USER_SIGNIN_FAIL,
  USER_SIGNOUT,
  USER_REGISTER_SUCCESS,
  USER_UPDATE_PROFILE_SUCCESS,
} from '../constants/userConstants';

describe('user reducers', () => {
  it('handles signin request/success/fail/signout', () => {
    const loading = userSigninReducer({}, { type: USER_SIGNIN_REQUEST });
    expect(loading).toEqual({ loading: true });

    const success = userSigninReducer(loading, {
      type: USER_SIGNIN_SUCCESS,
      payload: { _id: 'u1', name: 'Leo' },
    });
    expect(success).toEqual({ loading: false, userInfo: { _id: 'u1', name: 'Leo' } });

    const failed = userSigninReducer({}, { type: USER_SIGNIN_FAIL, payload: 'Invalid credentials' });
    expect(failed).toEqual({ loading: false, error: 'Invalid credentials' });

    const signedOut = userSigninReducer(success, { type: USER_SIGNOUT });
    expect(signedOut).toEqual({});
  });

  it('handles register success', () => {
    const state = userRegisterReducer({}, {
      type: USER_REGISTER_SUCCESS,
      payload: { _id: 'u2', email: 'user@gmail.com' },
    });
    expect(state).toEqual({ loading: false, userInfo: { _id: 'u2', email: 'user@gmail.com' } });
  });

  it('handles update profile success', () => {
    const state = userUpdateProfileReducer({}, { type: USER_UPDATE_PROFILE_SUCCESS });
    expect(state).toEqual({ loading: false, success: true });
  });
});
