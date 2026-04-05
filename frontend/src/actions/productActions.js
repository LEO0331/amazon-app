import apiClient from '../apiClient';
import {
    PRODUCT_LIST_REQUEST,
    PRODUCT_LIST_SUCCESS,
    PRODUCT_LIST_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    PRODUCT_CREATE_REQUEST,
    PRODUCT_CREATE_SUCCESS,
    PRODUCT_CREATE_FAIL,
    PRODUCT_UPDATE_REQUEST,
    PRODUCT_UPDATE_SUCCESS,
    PRODUCT_UPDATE_FAIL,
    PRODUCT_DELETE_REQUEST,
    PRODUCT_DELETE_SUCCESS,
    PRODUCT_DELETE_FAIL,
    PRODUCT_CATEGORY_LIST_REQUEST,
    PRODUCT_CATEGORY_LIST_SUCCESS,
    PRODUCT_CATEGORY_LIST_FAIL,
    PRODUCT_REVIEW_CREATE_REQUEST,
    PRODUCT_REVIEW_CREATE_SUCCESS,
    PRODUCT_REVIEW_CREATE_FAIL
} from '../constants/productConstants';

export const listProducts = ({pageNumber = '', seller = '', name = '', category = '', order = '', min = 0, max = 0, rating = 0}) => async (dispatch) => {
    dispatch({type: PRODUCT_LIST_REQUEST});
    try {
        const {data} = await apiClient.get(`/api/products?pageNumber=${pageNumber}&seller=${seller}&name=${name}&category=${category}&min=${min}&max=${max}&rating=${rating}&order=${order}`); //get products from backend through db
        dispatch({type: PRODUCT_LIST_SUCCESS, payload: data}) //dispatch actions: change the state of redux and update homescreen showing products
    } catch (error) {
        dispatch({type: PRODUCT_LIST_FAIL, payload: error.message});
    }
};

export const listProductCategories = () => async (dispatch) => {
    dispatch({type: PRODUCT_CATEGORY_LIST_REQUEST});
    try {
        const {data} = await apiClient.get(`/api/products/categories`); //get products from backend through db
        dispatch({type: PRODUCT_CATEGORY_LIST_SUCCESS, payload: data}) //dispatch actions: change the state of redux and update homescreen showing products
    } catch (error) {
        dispatch({type: PRODUCT_CATEGORY_LIST_FAIL, payload: error.message});
    }
};

export const detailsProduct = (productId) => async (dispatch) => {
    dispatch({type: PRODUCT_DETAILS_REQUEST, payload: productId});
    try {
        const {data} = await apiClient.get(`/api/products/${productId}`); //get specific product from server
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

export const createProduct = () => async (dispatch) => {
    dispatch({type: PRODUCT_CREATE_REQUEST});
    try {
        const {data} = await apiClient.post('/api/products', {}); //empty obj cuz no data as second param payload, auto create sample data in backend
        dispatch({type: PRODUCT_CREATE_SUCCESS, payload: data.product}); //new createdProduct
    } catch (error) {
        dispatch({
            type: PRODUCT_CREATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};

export const updateProduct = (product) => async (dispatch) => {
    dispatch({type: PRODUCT_UPDATE_REQUEST, payload: product});
    try {
        const {data} = await apiClient.put(`/api/products/${product._id}`, product); 
        dispatch({type: PRODUCT_UPDATE_SUCCESS, payload: data});
    } catch (error) {
        dispatch({
            type: PRODUCT_UPDATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};

export const deleteProduct = (productId) => async (dispatch) => {
    dispatch({type: PRODUCT_DELETE_REQUEST, payload: productId});
    try {
        const {data} = await apiClient.delete(`/api/products/${productId}`); 
        dispatch({type: PRODUCT_DELETE_SUCCESS}); //payload: data
    } catch (error) {
        dispatch({
            type: PRODUCT_DELETE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};

export const createReview = (productId, review) => async (dispatch) => {
    dispatch({type: PRODUCT_REVIEW_CREATE_REQUEST});
    try {
        const {data} = await apiClient.post(`/api/products/${productId}/reviews`, review); //empty obj cuz no data as second param payload, auto create sample data in backend
        dispatch({type: PRODUCT_REVIEW_CREATE_SUCCESS, payload: data.product}); //new createdProduct
    } catch (error) {
        dispatch({
            type: PRODUCT_REVIEW_CREATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};

