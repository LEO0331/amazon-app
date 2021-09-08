import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import StripeCheckout from '../components/StripeCheckout';
import axios from 'axios';
import LoadingBox from '../components/LoadingBox';
//https://stripe.com/docs/payments/integration-builder?client=react
function StripeOrderScreen(props){
    const orderDetails = useSelector(state => state.orderDetails);
    const { order } = orderDetails;
    const [stripe, setStripe] = useState(null);
    const dispatch = useDispatch();
    useEffect(() => {
        const addStripeScript = async () => {
            const { data: clientId } = await axios.get('/api/stripe/key');
            const stripeObj = await loadStripe(clientId);
            setStripe(stripeObj);
        };    
        return () => {};
    }, []);
    const handleSuccessPayment = async (paymentResult) => {
        dispatch();
    }
    //https://stripe.com/docs/payments/payment-intents
    return (
        <div>
            {!order.isPaid && !stripe && <LoadingBox />}
            {!order.isPaid && stripe && (
                <StripeCheckout stripe={stripe} orderId={order._id} handleSuccessPayment={handleSuccessPayment}/>
            )}
        </div>
    )
}

export default StripeOrderScreen;
