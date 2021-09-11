import axios from 'axios';
import { CART_EMPTY } from '../constants/cartConstants';
import {
    ORDER_CREATE_REQUEST,
    ORDER_CREATE_SUCCESS,
    ORDER_CREATE_FAIL,
    ORDER_DETAILS_REQUEST,
    ORDER_DETAILS_SUCCESS,
    ORDER_DETAILS_FAIL,
    ORDER_PAY_REQUEST,
    ORDER_PAY_SUCCESS,
    ORDER_PAY_FAIL,
    ORDER_MINE_LIST_REQUEST,
    ORDER_MINE_LIST_SUCCESS,
    ORDER_MINE_LIST_FAIL,
    ORDER_LIST_REQUEST,
    ORDER_LIST_SUCCESS,
    ORDER_LIST_FAIL
} from '../constants/orderConstants';

export const createOrder = (order) => async (dispatch, getState) => {
    dispatch({ type: ORDER_CREATE_REQUEST, payload: order });
    try {
        const {userSignin: { userInfo }} = getState();
        const { data } = await axios.post('/api/orders', order, {
            headers: { Authorization: `Bearer ${userInfo.token}` } //backend
        });
        dispatch({ type: ORDER_CREATE_SUCCESS, payload: data.order }); //orderRouter.js: { message: 'New Order Created', order: createdOrder } sent to frontend
        dispatch({ type: CART_EMPTY }); //remove all items from cart
        localStorage.removeItem('cartItems'); //<Link to={`/product/${item.product}`}>{item.name}</Link> in orderScreen will remove previous items from cart
    } catch (error) {
        dispatch({
            type: ORDER_CREATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const detailsOrder = (orderId) => async (dispatch, getState) => {
    dispatch({ type: ORDER_DETAILS_REQUEST, payload: orderId });
    const {userSignin: { userInfo }} = getState();
    try {
        const { data } = await axios.get(`/api/orders/${orderId}`, { //from backend
            headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        dispatch({ type: ORDER_DETAILS_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: ORDER_DETAILS_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};

export const payOrder = (order, paymentResult) => async (dispatch, getState) => {
    dispatch({ type: ORDER_PAY_REQUEST, payload: { order, paymentResult } });
    const {userSignin: { userInfo }} = getState();
    try { //put(url, body, options)
        const { data } = await axios.put(`/api/orders/${order._id}/pay`, paymentResult, { //sent to backend
            headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        dispatch({ type: ORDER_PAY_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: ORDER_PAY_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};

export const listOrderMine = () => async (dispatch, getState) => {
    dispatch({ type: ORDER_MINE_LIST_REQUEST });
    const {userSignin: { userInfo }} = getState();
    try { 
        const { data } = await axios.get('/api/orders/mine', { 
            headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        dispatch({ type: ORDER_MINE_LIST_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: ORDER_MINE_LIST_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};

export const listOrders = () => async (dispatch, getState) => {
    dispatch({ type: ORDER_LIST_REQUEST });
    const {userSignin: { userInfo }} = getState();
    try {
        const { data } = await axios.get(`/api/orders`, {
            headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        //console.log(data);
        dispatch({ type: ORDER_LIST_SUCCESS, payload: data }); //order array from backend
    } catch (error) {
        dispatch({
            type: ORDER_LIST_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};
