import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { isAdmin, isAuth, isAdminOrSeller, mailgun, payOrderEmailTemplate} from '../utils.js';

const orderRouter = express.Router();

orderRouter.get('/', isAuth, isAdminOrSeller, expressAsyncHandler(async (req, res) => { //join() in SQL
    const seller = req.query.seller || '';
    const sellerFilter = seller ? { seller } : {};
    const orders = await Order.find({...sellerFilter}).populate('user', 'name'); //https://mongoosejs.com/docs/populate.html#population
    res.send(orders);
}));

orderRouter.get('/summary', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([ //https://mongoosejs.com/docs/api/aggregate.html#aggregate_Aggregate
        {
            $group: { //https://docs.mongodb.com/manual/reference/operator/aggregation/group/
                _id: null, //null: accumulated values for all the input documents as a whole
                numOrders: { $sum: 1 }, //https://docs.mongodb.com/manual/reference/operator/aggregation/sum/#mongodb-group-grp.-sum
                totalSales: { $sum: '$totalPrice' } //all values in totalPrice
            }
        }
    ]);
    const users = await User.aggregate([ //summary.users[0].numUsers in dashboard screen
        {
            $group: {
                _id: null,
                numUsers: { $sum: 1 }
            }
        }
    ]);
    const dailyOrders = await Order.aggregate([
        {
            $group: { //https://docs.mongodb.com/manual/reference/operator/aggregation/dateToString/
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                orders: { $sum: 1 },
                sales: { $sum: '$totalPrice' }
            }
        },
        { $sort: { _id: 1 } }
    ]);
    const productCategories = await Product.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 }
            }
        }
    ]);
    res.send({ users, orders, dailyOrders, productCategories });
}));

orderRouter.post('/', isAuth, expressAsyncHandler(async (req, res) => {
    if (req.body.orderItems.length === 0) {
        res.status(400).send({ message: 'Cart is empty' }); //client error
    } else {
        const order = new Order({
            seller: req.body.orderItems[0].seller, //one product only one seller
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
    const order = await Order.findById(req.params.id).populate('user', 'email name');
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
        mailgun().messages().send({ //https://help.mailgun.com/hc/en-us/articles/203637190-How-Do-I-Add-or-Delete-a-Domain-
            from: 'Amazona <amazona@mg.yourdomain.com>',
            to: `${order.user.name} <${order.user.email}>`,
            subject: `New order ${order._id}`,
            html: payOrderEmailTemplate(order) //content in email body
        }, (error, body) => {
            if (error) {
                console.log(error);
            } else {
                console.log(body);
            }
        });
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

/*
https://stripe.com/docs/payments/integration-builder?client=react
import Stripe from 'stripe'; //https://www.npmjs.com/package/stripe
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
*/
export default orderRouter;
