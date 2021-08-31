import axios from 'axios';
import {
    PRODUCT_LIST_REQUEST,
    PRODUCT_LIST_SUCCESS,
    PRODUCT_LIST_FAIL
} from '../constants/productConstants';

export const listProducts = () => async dispatch => {
    dispatch({
        type: PRODUCT_LIST_REQUEST
    });
    try {
        const {data} = await axios.get('/api/products');
        dispatch({type: PRODUCT_LIST_SUCCESS, payload: data}) //dispatch actions: change the state of redux and update homescreen showing products
    } catch (error) {
        dispatch({type: PRODUCT_LIST_FAIL, payload: error.message});
    }
};
