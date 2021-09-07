import axios from 'axios';
import {
    USER_SIGNIN_REQUEST,
    USER_SIGNIN_SUCCESS,
    USER_SIGNIN_FAIL,
    USER_SIGNOUT,
    USER_REGISTER_REQUEST,
    USER_REGISTER_SUCCESS,
    USER_REGISTER_FAIL,
} from '../constants/userConstants';

export const register = (name, email, password) => async (dispatch) => {
    dispatch({type: USER_REGISTER_REQUEST, payload: {email, password}});
    try {
        const {data} = await axios.post('/api/users/register', {name, email, password}); //send to backend
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
        const {data} = await axios.post('/api/users/signin', {email, password}); //fetch from backend with user info and token
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

export const signout = () => (dispatch) => { //remove localstorage in store.js
    localStorage.removeItem('userInfo');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('shippingAddress');
    dispatch({type: USER_SIGNOUT});
    //document.location.href = '/signin';
};


