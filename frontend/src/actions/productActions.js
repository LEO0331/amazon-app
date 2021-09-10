import axios from 'axios';
import {
    PRODUCT_LIST_REQUEST,
    PRODUCT_LIST_SUCCESS,
    PRODUCT_LIST_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    PRODUCT_CREATE_REQUEST,
    PRODUCT_CREATE_SUCCESS,
    PRODUCT_CREATE_FAIL
} from '../constants/productConstants';

export const listProducts = () => async (dispatch) => {
    dispatch({type: PRODUCT_LIST_REQUEST});
    try {
        const {data} = await axios.get('/api/products'); //get products from backend
        dispatch({type: PRODUCT_LIST_SUCCESS, payload: data}) //dispatch actions: change the state of redux and update homescreen showing products
    } catch (error) {
        dispatch({type: PRODUCT_LIST_FAIL, payload: error.message});
    }
};

export const detailsProduct = (productId) => async (dispatch) => {
    dispatch({type: PRODUCT_DETAILS_REQUEST, payload: productId});
    try {
        const {data} = await axios.get(`/api/products/${productId}`); //get specific product from server
        dispatch({type: PRODUCT_DETAILS_SUCCESS, payload: data});
    } catch (error) {
        dispatch({
            type: PRODUCT_DETAILS_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};

export const createProduct = () => async (dispatch, getState) => {
    dispatch({type: PRODUCT_CREATE_REQUEST});
    const {userSignin: { userInfo }} = getState(); //userInfo token
    try {
        const {data} = await axios.post('/api/products', {}, { //empty obj cuz no data as payload
            headers: { Authorization: `Bearer ${userInfo.token}` }
        }); 
        dispatch({type: PRODUCT_CREATE_SUCCESS, payload: data});
    } catch (error) {
        dispatch({
            type: PRODUCT_CREATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

