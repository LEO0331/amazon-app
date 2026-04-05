import apiClient from '../apiClient';
import {
    USER_SIGNIN_REQUEST,
    USER_SIGNIN_SUCCESS,
    USER_SIGNIN_FAIL,
    USER_SIGNOUT,
    USER_REGISTER_REQUEST,
    USER_REGISTER_SUCCESS,
    USER_REGISTER_FAIL,
    USER_DETAILS_REQUEST,
    USER_DETAILS_FAIL,
    USER_DETAILS_SUCCESS,
    USER_UPDATE_PROFILE_FAIL,
    USER_UPDATE_PROFILE_REQUEST,
    USER_UPDATE_PROFILE_SUCCESS,
    USER_LIST_SUCCESS,
    USER_LIST_REQUEST,
    USER_LIST_FAIL,
    USER_DELETE_REQUEST,
    USER_DELETE_SUCCESS,
    USER_DELETE_FAIL,
    USER_UPDATE_REQUEST,
    USER_UPDATE_SUCCESS,
    USER_UPDATE_FAIL,
    USER_TOPSELLERS_LIST_REQUEST,
    USER_TOPSELLERS_LIST_SUCCESS,
    USER_TOPSELLERS_LIST_FAIL,
} from '../constants/userConstants';

export const register = (name, email, password) => async (dispatch) => {
    dispatch({type: USER_REGISTER_REQUEST, payload: {email, password}});
    try {
        const {data} = await apiClient.post('/api/users/register', {name, email, password}); //send to backend
        dispatch({type: USER_REGISTER_SUCCESS, payload: data});
        dispatch({type: USER_SIGNIN_SUCCESS, payload: data}); //update redux store based on user signin; in app.js use userSignin to auth users
        localStorage.setItem('userInfo', JSON.stringify(data));
    } catch (error) {
        dispatch({
            type: USER_REGISTER_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};

export const signin = (email, password) => async (dispatch) => {
    dispatch({type: USER_SIGNIN_REQUEST, payload: {email, password}});
    try {
        const {data} = await apiClient.post('/api/users/signin', {email, password}); //fetch from backend with user info and token
        dispatch({type: USER_SIGNIN_SUCCESS, payload: data});
        localStorage.setItem('userInfo', JSON.stringify(data));
    } catch (error) {
        dispatch({ //same format as detailsProduct in productActions.js
            type: USER_SIGNIN_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const detailsUser = (userId) => async (dispatch) => {
    dispatch({type: USER_DETAILS_REQUEST, payload: userId});
    try {
        const { data } = await apiClient.get(`/api/users/${userId}`);
        dispatch({ type: USER_DETAILS_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: USER_DETAILS_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const updateUserProfile = (user) => async (dispatch) => {
    dispatch({type: USER_UPDATE_PROFILE_REQUEST, payload: user});
    try { //update action
        const { data } = await apiClient.put('/api/users/profile', user);
        dispatch({ type: USER_UPDATE_PROFILE_SUCCESS, payload: data });
        dispatch({ type: USER_SIGNIN_SUCCESS, payload: data }); //header shows user name from user signin
        localStorage.setItem('userInfo', JSON.stringify(data));
    } catch (error) {
        dispatch({
            type: USER_UPDATE_PROFILE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const updateUser = (user) => async (dispatch) => {
    dispatch({ type: USER_UPDATE_REQUEST, payload: user }); //USER_UPDATE_PROFILE_REQUEST
    try {
        const { data } = await apiClient.put(`/api/users/${user._id}`, user);
        dispatch({ type: USER_UPDATE_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: USER_UPDATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const listUsers = () => async (dispatch) => {
    dispatch({ type: USER_LIST_REQUEST });
    try {
        const { data } = await apiClient.get('/api/users');
        dispatch({ type: USER_LIST_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: USER_LIST_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
} 

export const listTopSellers = () => async (dispatch) => {
    dispatch({ type: USER_TOPSELLERS_LIST_REQUEST });
    try {
        const { data } = await apiClient.get('/api/users/top-sellers');
        dispatch({ type: USER_TOPSELLERS_LIST_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: USER_TOPSELLERS_LIST_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const deleteUser = (userId) => async (dispatch) => {
    dispatch({ type: USER_DELETE_REQUEST, payload: userId });
    try {
        const { data } = await apiClient.delete(`/api/users/${userId}`);
        dispatch({ type: USER_DELETE_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: USER_DELETE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const signout = () => async (dispatch) => { //remove localstorage in store.js
    try {
        await apiClient.post('/api/users/signout');
    } catch (error) {
        // Proceed with local signout even if API request fails.
    }
    localStorage.removeItem('userInfo');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('shippingAddress');
    dispatch({type: USER_SIGNOUT});
    //document.location.href = '/signin';
};




