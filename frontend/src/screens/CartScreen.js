import React, { useEffect } from 'react'
import { addToCart } from '../actions/cartActions';
import { useDispatch, useSelector } from 'react-redux';

function CartScreen(props) { //path="/cart/:id?"
    const productId = props.match.params.id;
    //https://reactrouter.com/web/api/location
    const qty = props.location.search // /cart/${productId}?qty=${qty}
        ? Number(props.location.search.split('=')[1])
        : 1;
    //https://reactjs.org/docs/hooks-faq.html#what-do-hooks-mean-for-popular-apis-like-redux-connect-and-react-router
    const dispatch = useDispatch();
    const cart = useSelector(state => state.cart);
    const { cartItems, error } = cart; //from reducers
    useEffect(() => { //combination of componentDidMount,componentDidUpdate, componentWillUnmount
        if (productId) {
            dispatch(addToCart(productId, qty)); //from actions
        }
    }, [dispatch, productId, qty]);

    return (
        <div>
            <h1>Cart</h1>
            <p>ID: {productId} QTY:{qty}</p>
        </div>
    )
}

export default CartScreen;
