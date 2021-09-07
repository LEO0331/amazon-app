import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { detailsOrder, payOrder } from '../actions/orderActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { PayPalButton } from "react-paypal-button-v2"; //https://www.npmjs.com/package/react-paypal-button-v2
import { ORDER_PAY_RESET } from '../constants/orderConstants';

function OrderScreen(props) {
    const [sdkReady, setSdkReady] = useState(false); //Software Development Kit
    const orderId = props.match.params.id;
    const orderDetails = useSelector(state => state.orderDetails);
    const { order, loading, error } = orderDetails;
    const orderPay = useSelector(state => state.orderPay);
    const { loading: loadingPay, error: errorPay, success: successPay } = orderPay; //rename
    const dispatch = useDispatch();
    useEffect(() => {
        //https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-configuration/
        const addPayPalScript = async () => { //send to backend getting clientId
            const {data} = await axios.get('/api/config/paypal');
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = `https://www.paypal.com/sdk/js?client-id=${data}&locale=en_AU`;
            script.async = true;
            script.onload = () => setSdkReady(true); //occurs when an object has been loaded; execute a script once a web page has completed
            document.body.appendChild(script); //add as last child of body in html
            /* https://developer.paypal.com/classic-home
            <script src="https://www.paypal.com/sdk/js?client-id=sb&locale=en_AU&currency=AUD"></script> 
            <script>paypal.Buttons().render('body');</script>
            */
        }
        if (!order || successPay || (order && order._id !== orderId)) {
            dispatch({ type: ORDER_PAY_RESET }); //reset to avoid infinite loading
            dispatch(detailsOrder(orderId)); //from url; refresh and update
        } else {
            if (!order.isPaid) {
                if (!window.paypal) {
                    addPayPalScript();
                } else {
                    setSdkReady(true); //already load paypal
                }
            }
        }
    }, [dispatch, order, orderId, sdkReady, successPay]); //run useEffect() when order, orderId, sdkReady changed
    const successPaymentHandler = (paymentResult) => {
        dispatch(payOrder(order, paymentResult));
    };
    return loading ? (
        <LoadingBox />
    ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
    ) : (
        <div>
            <h1>Order {order._id}</h1>
            <div className="row top">
                <div className="col-2">
                    <ul>
                        <li>
                            <div className="card card-body">
                                <h2>Shipping Information</h2>
                                <p>
                                    <strong>Name:</strong> {order.shippingAddress.fullName} <br />
                                    <strong>Address: </strong> {order.shippingAddress.address},
                                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                                </p>
                                {order.isDelivered ? (
                                    <MessageBox variant="success">Delivered at {order.deliveredAt}</MessageBox>
                                ) : (
                                    <MessageBox variant="danger">Not Delivered</MessageBox>
                                )}
                            </div>
                        </li>
                        <li>
                            <div className="card card-body">
                                <h2>Payment Information</h2>
                                <p><strong>Method:</strong> {order.paymentMethod}</p>
                                {order.isPaid ? ( //toLocaleDateString
                                    <MessageBox variant="success">Paid at {new Date(order.paidAt).toLocaleString()}</MessageBox>
                                ) : (
                                    <MessageBox variant="danger">Not Paid</MessageBox>
                                )}
                            </div>
                        </li>
                        <li>
                            <div className="card card-body">
                                <h2>Order Information</h2>
                                <ul>
                                    {order.orderItems.map(item => (
                                        <li key={item.product}>
                                            <div className="row">
                                                <div>
                                                    <img src={item.image} alt={item.name} className="small" />
                                                </div>
                                                <div className="min-30">
                                                    <Link to={`/product/${item.product}`}>{item.name}</Link>
                                                </div>
                                                <div>
                                                    {item.qty} x ${item.price} = ${item.qty * item.price}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="col-1">
                    <div className="card card-body">
                        <ul>
                            <li>
                                <h2>Order Summary</h2>
                            </li>
                            <li>
                                <div className="row">
                                    <div>Items</div>
                                    <div>${order.itemsPrice.toFixed(2)}</div>
                                </div>
                            </li>
                            <li>
                                <div className="row">
                                    <div>Shipping</div>
                                    <div>${order.shippingPrice.toFixed(2)}</div>
                                </div>
                            </li>
                            <li>
                                <div className="row">
                                    <div>Tax</div>
                                    <div>${order.taxPrice.toFixed(2)}</div>
                                </div>
                            </li>
                            <li>
                                <div className="row">
                                    <div><strong> Order Total</strong></div>
                                    <div><strong>${order.totalPrice.toFixed(2)}</strong></div>
                                </div>
                            </li>
                            {
                                !order.isPaid && (
                                    <li>
                                        {
                                            !sdkReady ? (
                                                <LoadingBox />
                                            ) : (
                                                <>
                                                    {loadingPay && <LoadingBox />}
                                                    {errorPay && (<MessageBox variant="danger">{errorPay}</MessageBox>)}
                                                    <PayPalButton amount={order.totalPrice} onSuccess={successPaymentHandler} />
                                                </>
                                            )
                                        }
                                    </li>
                                )
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderScreen;
