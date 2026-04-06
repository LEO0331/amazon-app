import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../apiClient';
import {
  deleteUser,
  detailsUser,
  listTopSellers,
  listUsers,
  register,
  signin,
  signout,
  updateUser,
  updateUserProfile,
} from './userActions';
import {
  USER_DELETE_FAIL,
  USER_DELETE_REQUEST,
  USER_DELETE_SUCCESS,
  USER_DETAILS_FAIL,
  USER_DETAILS_REQUEST,
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
  USER_UPDATE_PROFILE_SUCCESS,
  USER_UPDATE_REQUEST,
  USER_UPDATE_SUCCESS,
} from '../constants/userConstants';

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
  vi.stubGlobal('localStorage', {
    setItem: vi.fn(),
    removeItem: vi.fn(),
  });
});

describe('userActions', () => {
  it('dispatches register success and signs in', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { _id: 'u1', email: 'a@b.com' } });
    await register('Name', 'a@b.com', '1234')(dispatch);

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: USER_REGISTER_REQUEST,
      payload: { email: 'a@b.com', password: '1234' },
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: USER_REGISTER_SUCCESS,
      payload: { _id: 'u1', email: 'a@b.com' },
    });
    expect(dispatch).toHaveBeenNthCalledWith(3, {
      type: USER_SIGNIN_SUCCESS,
      payload: { _id: 'u1', email: 'a@b.com' },
    });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'userInfo',
      JSON.stringify({ _id: 'u1', email: 'a@b.com' })
    );
  });

  it('dispatches register/signin failure', async () => {
    apiClient.post.mockRejectedValueOnce(mockError('email exists'));
    await register('Name', 'a@b.com', '1234')(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: USER_REGISTER_REQUEST,
      payload: { email: 'a@b.com', password: '1234' },
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: USER_REGISTER_FAIL,
      payload: 'email exists',
    });

    dispatch.mockReset();
    apiClient.post.mockRejectedValueOnce(new Error('signin failed'));
    await signin('a@b.com', '1234')(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: USER_SIGNIN_REQUEST,
      payload: { email: 'a@b.com', password: '1234' },
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: USER_SIGNIN_FAIL,
      payload: 'signin failed',
    });
  });

  it('dispatches signin/details/update profile branches', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { _id: 'u1' } });
    await signin('a@b.com', '1234')(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: USER_SIGNIN_REQUEST,
      payload: { email: 'a@b.com', password: '1234' },
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: USER_SIGNIN_SUCCESS,
      payload: { _id: 'u1' },
    });

    dispatch.mockReset();
    apiClient.get.mockResolvedValueOnce({ data: { _id: 'u2' } });
    await detailsUser('u2')(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: USER_DETAILS_REQUEST, payload: 'u2' });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: USER_DETAILS_SUCCESS,
      payload: { _id: 'u2' },
    });

    dispatch.mockReset();
    apiClient.get.mockRejectedValueOnce(mockError('user missing'));
    await detailsUser('u3')(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: USER_DETAILS_REQUEST, payload: 'u3' });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: USER_DETAILS_FAIL,
      payload: 'user missing',
    });

    dispatch.mockReset();
    apiClient.put.mockResolvedValueOnce({ data: { _id: 'u1', name: 'Updated' } });
    await updateUserProfile({ name: 'Updated' })(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: USER_UPDATE_PROFILE_REQUEST,
      payload: { name: 'Updated' },
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: USER_UPDATE_PROFILE_SUCCESS,
      payload: { _id: 'u1', name: 'Updated' },
    });
    expect(dispatch).toHaveBeenNthCalledWith(3, {
      type: USER_SIGNIN_SUCCESS,
      payload: { _id: 'u1', name: 'Updated' },
    });

    dispatch.mockReset();
    apiClient.put.mockRejectedValueOnce(mockError('profile update failed'));
    await updateUserProfile({ name: 'Bad' })(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: USER_UPDATE_PROFILE_REQUEST,
      payload: { name: 'Bad' },
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: USER_UPDATE_PROFILE_FAIL,
      payload: 'profile update failed',
    });
  });

  it('dispatches list/update/delete/top sellers branches', async () => {
    apiClient.get.mockResolvedValueOnce({ data: [{ _id: 'u1' }] });
    await listUsers()(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: USER_LIST_REQUEST });
    expect(dispatch).toHaveBeenNthCalledWith(2, { type: USER_LIST_SUCCESS, payload: [{ _id: 'u1' }] });

    dispatch.mockReset();
    apiClient.get.mockRejectedValueOnce(mockError('list users failed'));
    await listUsers()(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: USER_LIST_REQUEST });
    expect(dispatch).toHaveBeenNthCalledWith(2, { type: USER_LIST_FAIL, payload: 'list users failed' });

    dispatch.mockReset();
    apiClient.get.mockResolvedValueOnce({ data: [{ _id: 'seller1' }] });
    await listTopSellers()(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: USER_TOPSELLERS_LIST_REQUEST });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: USER_TOPSELLERS_LIST_SUCCESS,
      payload: [{ _id: 'seller1' }],
    });

    dispatch.mockReset();
    apiClient.get.mockRejectedValueOnce(mockError('top sellers failed'));
    await listTopSellers()(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: USER_TOPSELLERS_LIST_REQUEST });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: USER_TOPSELLERS_LIST_FAIL,
      payload: 'top sellers failed',
    });

    dispatch.mockReset();
    apiClient.put.mockResolvedValueOnce({ data: { message: 'updated' } });
    await updateUser({ _id: 'u2', name: 'x' })(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: USER_UPDATE_REQUEST,
      payload: { _id: 'u2', name: 'x' },
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: USER_UPDATE_SUCCESS,
      payload: { message: 'updated' },
    });

    dispatch.mockReset();
    apiClient.put.mockRejectedValueOnce(mockError('update failed'));
    await updateUser({ _id: 'u3' })(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: USER_UPDATE_REQUEST,
      payload: { _id: 'u3' },
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: USER_UPDATE_FAIL,
      payload: 'update failed',
    });

    dispatch.mockReset();
    apiClient.delete.mockResolvedValueOnce({ data: { message: 'deleted' } });
    await deleteUser('u2')(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: USER_DELETE_REQUEST, payload: 'u2' });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: USER_DELETE_SUCCESS,
      payload: { message: 'deleted' },
    });

    dispatch.mockReset();
    apiClient.delete.mockRejectedValueOnce(mockError('delete failed'));
    await deleteUser('u3')(dispatch);
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: USER_DELETE_REQUEST, payload: 'u3' });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: USER_DELETE_FAIL,
      payload: 'delete failed',
    });
  });

  it('dispatches local signout even if API signout fails', async () => {
    apiClient.post.mockRejectedValueOnce(new Error('network'));
    await signout()(dispatch);

    expect(localStorage.removeItem).toHaveBeenCalledWith('userInfo');
    expect(localStorage.removeItem).toHaveBeenCalledWith('cartItems');
    expect(localStorage.removeItem).toHaveBeenCalledWith('shippingAddress');
    expect(dispatch).toHaveBeenCalledWith({ type: USER_SIGNOUT });
  });
});
