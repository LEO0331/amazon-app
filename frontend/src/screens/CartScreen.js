import React, { useEffect } from 'react'
import { addToCart, removeFromCart } from '../actions/cartActions';
import { useDispatch, useSelector } from 'react-redux';
import MessageBox from '../components/MessageBox';
import { Link } from 'react-router-dom';

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
            dispatch(addToCart(productId, qty)); //from actions, item.product is product id
        }
    }, [dispatch, productId, qty]);
    const removeFromCartHandler = id => {
        dispatch(removeFromCart(id)); // delete action
    }
    const checkoutHandler = () => {
        props.history.push('/signin?redirect=shipping'); //redirect to signin/shipping screen
    }
    return (
        <div className="row top">
            <div className="col-2">
                <h1>Shopping Cart</h1>
                {error && <MessageBox variant="danger">{error}</MessageBox>}
                {cartItems.length === 0 ? (
                    <MessageBox>Cart is empty. <Link to="/">Go Shopping Now~~</Link></MessageBox>
                ) : (
                    <ul>
                        {
                            cartItems.map(item => (
                                <li key={item.product}>
                                    <div className="row">
                                        <div>
                                            <img src={item.image} alt={item.name} className="small" />
                                        </div>
                                        <div className="min-30">
                                            <Link to={`/product/${item.product}`}>{item.name}</Link>
                                        </div>
                                        <div>
                                            <select value={item.qty} onChange={e => dispatch(addToCart(item.product, Number(e.target.value)))}>
                                                {[...Array(item.countInStock).keys()].map(x => ( //x from 0, same func in productScreen
                                                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>${item.price}</div>
                                        <div>
                                            <button type="button" onClick={() => removeFromCartHandler(item.product)}>Remove</button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                    </ul>
                )}
            </div>
            <div className="col-1">
                <div className="card card-body">
                    <ul>
                        <li>
                            <h2>
                                Subtotal{" "}{cartItems.reduce((a, c) => a + c.qty, 0)}{" "}items : $
                                {cartItems.reduce((a, c) => a + c.price * c.qty, 0)}
                            </h2>
                        </li>
                        <li>
                            <button type="button" onClick={checkoutHandler} className="primary block" disabled={cartItems.length === 0}>
                                Proceed to Checkout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default CartScreen;
