import apiClient from '../apiClient';
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
    ORDER_LIST_FAIL,
    ORDER_DELETE_REQUEST,
    ORDER_DELETE_SUCCESS,
    ORDER_DELETE_FAIL,
    ORDER_DELIVER_REQUEST,
    ORDER_DELIVER_SUCCESS,
    ORDER_DELIVER_FAIL,
    ORDER_SUMMARY_REQUEST,
    ORDER_SUMMARY_SUCCESS
} from '../constants/orderConstants';

export const createOrder = (order) => async (dispatch) => {
    dispatch({ type: ORDER_CREATE_REQUEST, payload: order });
    try {
        const { data } = await apiClient.post('/api/orders', order);
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
};

export const detailsOrder = (orderId) => async (dispatch) => {
    dispatch({ type: ORDER_DETAILS_REQUEST, payload: orderId });
    try {
        const { data } = await apiClient.get(`/api/orders/${orderId}`); //from backend
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

export const payOrder = (order, paymentResult) => async (dispatch) => {
    dispatch({ type: ORDER_PAY_REQUEST, payload: { order, paymentResult } });
    try { //put(url, body, options)
        const { data } = await apiClient.put(`/api/orders/${order._id}/pay`, paymentResult); //sent to backend
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

export const listOrderMine = () => async (dispatch) => {
    dispatch({ type: ORDER_MINE_LIST_REQUEST });
    try { 
        const { data } = await apiClient.get('/api/orders/mine');
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

export const listOrders = ({seller = ''}) => async (dispatch) => {
    dispatch({ type: ORDER_LIST_REQUEST });
    try {
        const { data } = await apiClient.get(`/api/orders?seller=${seller}`);
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

export const deleteOrder = (orderId) => async (dispatch) => {
    dispatch({ type: ORDER_DELETE_REQUEST, payload: orderId });
    try {
        const { data } = await apiClient.delete(`/api/orders/${orderId}`);
        dispatch({ type: ORDER_DELETE_SUCCESS, payload: data }); 
    } catch (error) {
        dispatch({
            type: ORDER_DELETE_FAIL,
            payload: error.response && error.response.data.message //from backend delete('/:id') {message:Order not found}
                ? error.response.data.message
                : error.message,
        });
    }
};

export const deliverOrder = (orderId) => async (dispatch) => {
    dispatch({ type: ORDER_DELIVER_REQUEST, payload: orderId });
    try { //put(url, body, options)
        const { data } = await apiClient.put(`/api/orders/${orderId}/deliver`, {});
        dispatch({ type: ORDER_DELIVER_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: ORDER_DELIVER_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};

export const summaryOrder = () => async (dispatch) => {
    dispatch({ type: ORDER_SUMMARY_REQUEST });
    try {
        const { data } = await apiClient.get('/api/orders/summary');
        dispatch({ type: ORDER_SUMMARY_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: ORDER_CREATE_FAIL,
            payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
        });
    }
};

