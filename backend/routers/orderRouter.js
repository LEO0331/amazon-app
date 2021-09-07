import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import {
    //isAdmin,
    isAuth,
    //isSellerOrAdmin,
    //mailgun,
    //payOrderEmailTemplate,
} from '../utils.js';

const orderRouter = express.Router();

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

export default orderRouter;
