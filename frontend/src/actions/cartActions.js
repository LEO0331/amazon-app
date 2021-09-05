import axios from 'axios';
import {
    CART_ADD_ITEM,
    CART_REMOVE_ITEM,
    CART_ADD_ITEM_FAIL,
    CART_SAVE_SHIPPING_ADDRESS,
    CART_SAVE_PAYMENT_METHOD
} from '../constants/cartConstants';
//https://redux.js.org/api/store#getstate
export const addToCart = (productId, qty) => async (dispatch, getState) => {
    const { data } = await axios.get(`/api/products/${productId}`);
    //const { cart: { cartItems } } = getState();
    dispatch({
        type: CART_ADD_ITEM,
        payload: { //add this product to the cart
            name: data.name,
            image: data.image,
            price: data.price,
            countInStock: data.countInStock,
            product: data._id, //add to database
            //seller: data.seller,
            qty
        }
    });
    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems)); //store.js initial
}

export const removeFromCart = (productId) => (dispatch, getState) => {
    dispatch({ type: CART_REMOVE_ITEM, payload: productId });
    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems)); //update local storage
};

export const saveShippingAddress = (data) => (dispatch) => { //data from ShippingAddress screen
    dispatch({ type: CART_SAVE_SHIPPING_ADDRESS, payload: data });
    localStorage.setItem('shippingAddress', JSON.stringify(data));
};
  
export const savePaymentMethod = (data) => (dispatch) => { //select radio button
    dispatch({ type: CART_SAVE_PAYMENT_METHOD, payload: data });
};
