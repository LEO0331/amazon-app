import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { isAdmin, isAuth,
    //isSellerOrAdmin,
    //mailgun,
    //payOrderEmailTemplate,
} from '../utils.js';
import Stripe from 'stripe'; //https://www.npmjs.com/package/stripe

const orderRouter = express.Router();

orderRouter.get('/', isAuth, isAdmin, expressAsyncHandler(async (req, res) => { //join() in SQL
    const orders = await Order.find({}).populate('user', 'name'); //https://mongoosejs.com/docs/populate.html#population
    res.send(orders);
}));

orderRouter.post('/', isAuth, expressAsyncHandler(async (req, res) => {
    if (req.body.orderItems.length === 0) {
        res.status(400).send({ message: 'Cart is empty' }); //client error
    } else {
        const order = new Order({
            orderItems: req.body.orderItems,
            shippingAddress: req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod,
            itemsPrice: req.body.itemsPrice,
            shippingPrice: req.body.shippingPrice,
            taxPrice: req.body.taxPrice,
            totalPrice: req.body.totalPrice,
            user: req.user._id, //from middleware in util.js to authenticate
        })
        const createdOrder = await order.save(); //require save() in post to save new created model() in db
        res.status(201).send({ message: 'New Order Created', order: createdOrder }); //to frontend '/api/orders/'
    }
}));

orderRouter.get('/mine', isAuth, expressAsyncHandler(async (req, res) => { //above /:id due to the concept of precedence for routers
    const orders = await Order.find({ user: req.user._id }); //decoded JWT payload is available on the request via the user property
    res.send(orders);
}));

orderRouter.get('/:id', isAuth, expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id); //similar to product details api
    if (order) {
        res.send(order);
    } else {
        res.status(404).send({message: 'Order Not Found'});
    }
}));

orderRouter.put('/:id/pay', isAuth, expressAsyncHandler(async (req, res) => { //update status of order
    const order = await Order.findById(req.params.id);
    if (order){
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = { //info from paypal; https://developer.paypal.com/docs/api/payments/v2/
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address
        };
        const updatedOrder = await order.save();
        res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
        res.status(404).send({ message: 'Order Not Found' });
    }
}));

orderRouter.delete('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
        const deleteOrder = await order.remove();
        res.send({ message: 'Order Deleted', product: deleteOrder });
    } else {
        res.status(404).send({ message: 'Order Not Found' });
    }
}));

orderRouter.put('/:id/deliver', isAuth, isAdmin, expressAsyncHandler(async (req, res) => { //update status of order
    const order = await Order.findById(req.params.id);
    if (order){
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        const updatedOrder = await order.save();
        res.send({ message: 'Order Delivered', order: updatedOrder });
    } else {
        res.status(404).send({ message: 'Order Not Found' });
    }
}));

//https://stripe.com/docs/payments/integration-builder?client=react
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
orderRouter.post('/secret/:id', isAuth, expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
        };
        const { totalPrices } = req.body.totalPrice
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalPrices,
            currency: "usd"
        });
        const updatedOrder = await order.save();
        res.send({ message: 'Order Paid', order: updatedOrder, clientSecret: paymentIntent.client_secret });
    } else {
        res.status(404).send({ message: 'Order Not Found' });
    }
}));

export default orderRouter;
