import React, { useState } from 'react';
import {CardElement, Elements, useStripe, useElements} from '@stripe/react-stripe-js';
import axios from 'axios';
//https://stripe.com/docs/testing
function CheckoutForm(props) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setProcessing(true);
    //https://stripe.com/docs/api/payment_intents/object
    const { data } = await axios(`/api/stripe/secret/${props.orderId}`);
    const clientSecret = data.client_secret; //call stripe.confirmCardPayment() from the client secret.
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: data.order.user.name,
          email: data.order.user.email,
        },
      },
    });
    if (result.error){
      alert(result.error.message);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        props.handleSuccessPayment(result.paymentIntent);
        // alert(result.paymentIntent.status);
      }
    }
    setProcessing(false);
  }
  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe || processing}>Pay With Stripe</button>
    </form>
  );
};

const StripeCheckout = (props) => (
  <Elements stripe={props.stripe}>
    <CheckoutForm rderId={props.orderId} handleSuccessPayment={props.handleSuccessPayment} />
  </Elements>
);

export default StripeCheckout;
