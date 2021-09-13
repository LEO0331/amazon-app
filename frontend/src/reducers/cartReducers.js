import {
    CART_ADD_ITEM,
    CART_ADD_ITEM_FAIL,
    CART_EMPTY,
    CART_REMOVE_ITEM,
    CART_SAVE_PAYMENT_METHOD,
    CART_SAVE_SHIPPING_ADDRESS,
} from '../constants/cartConstants';

export const cartReducer = (state = { cartItems: [] }, action) => { //error: ''
    switch (action.type){
        case CART_ADD_ITEM:
            const item = action.payload; //product: data._id; new item
            const existItem = state.cartItems.find(x => x.product === item.product); //item already in the cart; action.payload.product -> id
            if(existItem){
                return { //only update changed item, others remain
                    ...state, //current items
                    error: '', //order items from one seller; prevent buying same products from different sellers
                    cartItems: state.cartItems.map(x => x.product === existItem.product ? item : x) //only replace changed item
                };
            } else {
                return { ...state, error: '', cartItems: [...state.cartItems, item] }; //concat; push items into arr of objects
            }
        case CART_REMOVE_ITEM:
            return { //not change other properties of the cart object
                ...state,
                error: '', //order items from one seller; prevent buying same products from different sellers
                cartItems: state.cartItems.filter(x => x.product !== action.payload)
            };
            case CART_SAVE_SHIPPING_ADDRESS:
                return { ...state, shippingAddress: action.payload };
            case CART_SAVE_PAYMENT_METHOD:
                return { ...state, paymentMethod: action.payload };
            case CART_ADD_ITEM_FAIL:
                return { ...state, error: action.payload };
            case CART_EMPTY:
                return { ...state, error: '', cartItems: [] }; //order items from one seller; prevent buying same products from different seller
        default:
            return state;
    }
};


/*
const index = state.cartItems.findIndex(x => x.product === item.product);
cartItems: state.cartItems[index] = item
*/
