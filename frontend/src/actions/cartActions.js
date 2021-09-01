import axios from 'axios';
import {
    CART_ADD_ITEM,
    //CART_REMOVE_ITEM,
    //CART_SAVE_SHIPPING_ADDRESS,
    //CART_SAVE_PAYMENT_METHOD,
    //CART_ADD_ITEM_FAIL,
} from '../constants/cartConstants';
//https://redux.js.org/api/store#getstate
export const addToCart = (productId, qty) => async (dispatch, getState) => {
    const { data } = await axios.get(`/api/products/${productId}`);
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
