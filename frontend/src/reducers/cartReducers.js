import {
    CART_ADD_ITEM,
    //CART_ADD_ITEM_FAIL,
    //CART_EMPTY,
    CART_REMOVE_ITEM,
    //CART_SAVE_PAYMENT_METHOD,
    //CART_SAVE_SHIPPING_ADDRESS,
} from '../constants/cartConstants';

export const cartReducer = (state = { cartItems: [] }, action) => { //error: ''
    switch (action.type){
        case CART_ADD_ITEM:
            const item = action.payload; //product: data._id; new item
            //item already in the cart
            const existItem = state.cartItems.find(x => x.product === item.product); //action.payload.product -> id
            if(existItem){
                return { //only update changed item, others remain
                    ...state, //current items
                    error: '',
                    cartItems: state.cartItems.map(x => x.product === existItem.product ? item : x) //only replace changed item
                };
            } else {
                return { ...state, error: '', cartItems: [...state.cartItems, item] }; //concat; push items into arr of onjects
            }
        case CART_REMOVE_ITEM:
            return { //not change other properties of the cart object
                ...state,
                error: '',
                cartItems: state.cartItems.filter(x => x.product !== action.payload)
            };
        default:
            return state;
    }
};


/*
const index = state.cartItems.findIndex(x => x.product === item.product);
cartItems: state.cartItems[index] = item
*/
