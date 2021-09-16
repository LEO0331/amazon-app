import express from 'express';
import expressAsyncHandler from 'express-async-handler'; //try-catch
import data from '../data.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import { isAdmin, isAdminOrSeller, isAuth } from '../utils.js';

const productRouter = express.Router();
//https://www.geeksforgeeks.org/mongoose-find-function/
productRouter.get('/', expressAsyncHandler(async (req, res) => { //add to the end: /api/products/ -> exact api frontend send to
    const pageSize = 8; //contain ? products in a page
    const page = Number(req.query.pageNumber) || 1;
    const seller = req.query.seller || '';
    const name = req.query.name || '';
    const category = req.query.category || '';
    const min = req.query.min && Number(req.query.min) !== 0 ? Number(req.query.min) : 0;
    const max = req.query.max && Number(req.query.max) !== 0 ? Number(req.query.max) : 0; //max can be 0 as Any product in util.js
    const order = req.query.order || '';
    const rating = req.query.rating && Number(req.query.rating) !== 0 ? Number(req.query.rating) : 0;
    const sellerFilter = seller ? { seller } : {}; //{}: all products; get from '/seed' and post('/')
    const nameFilter = name ? { name: { $regex: name, $options: 'i' } } : {}; //contained check: https://docs.mongodb.com/manual/reference/operator/query/regex/
    const categoryFilter = category ? { category } : {};
    const priceFilter = min && max ? { price: { $gte: min, $lte: max } } : {}; //>=, <=
    const ratingFilter = rating ? { rating: { $gte: rating } } : {};
    const sortOrder = order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : { _id: -1 }; //newest
    const count = await Product.count({
        ...sellerFilter,
        ...nameFilter,
        ...categoryFilter,
        ...priceFilter,
        ...ratingFilter,
    });
    const products = await Product.find({
        ...sellerFilter,
        ...nameFilter,
        ...categoryFilter,
        ...priceFilter,
        ...ratingFilter
    }).populate('seller', 'seller.name seller.logo').sort(sortOrder).skip(pageSize * (page - 1)).limit(pageSize); //only obj fields
    res.send({products, page, pages: Math.ceil(count / pageSize)}); //https://stackoverflow.com/questions/5539955/how-to-paginate-with-mongoose-in-node-js
}));

productRouter.get('/categories', expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category'); //Return Distinct Values for a Field
    res.send(categories);
}));

productRouter.get('/seed', expressAsyncHandler(async (req, res) => { //products showing on the homeScreen
    await Product.remove({});
    //https://www.geeksforgeeks.org/mongoose-insertmany-function/
    const seller = await User.findOne({ isSeller: true });
    if (seller) { //all products have sellers
        const products = data.products.map(product => ({...product, seller: seller._id,}));
        const createdProducts = await Product.insertMany(products); //insertMany() function is used to insert multiple documents into a collection. It accepts an array of documents to insert into the collection.
        res.send({ createdProducts }); //{[{p1},{p2}]}; can be reach from get('/')
    } else {
        res.status(500).send({ message: 'No seller found. Please first run /api/users/seed' });
    }
}));
//put at the end to avoid get '/seed' as id; https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes
productRouter.get('/:id', expressAsyncHandler(async (req, res) => { //product details api
    const product = await Product.findById(req.params.id).populate('seller', 'seller.name seller.logo seller.rating seller.numReviews');
    if (product) {
        res.send(product);
    } else {
        res.status(404).send({ message: 'Product Not Found' });
    }
    /* https://stackoverflow.com/questions/43055600/app-get-is-there-any-difference-between-res-send-vs-return-res-send
    if (product) {
        return res.send(product);
    }
    res.status(404).send({message: 'Product Not Found'});
    */
}));

productRouter.post('/',  isAuth, isAdminOrSeller, expressAsyncHandler(async (req, res) => {
    const product = new Product({ //sample data; timestamp to unique data avoid duplicate error
        name: 'sample name ' + Date.now(),
        seller: req.user._id, //current user see their products
        image: '/images/p1.jpg',
        price: 0,
        category: 'sample category',
        brand: 'sample brand',
        countInStock: 0,
        rating: 0,
        numReviews: 0,
        description: 'sample description',
    });
    const createdProduct = await product.save();
    res.send({ message: 'Product Created', product: createdProduct }); //product: use in createProduct action; not related to get('/') cuz its product is directly from db
}));

productRouter.put('/:id', isAuth, isAdminOrSeller, expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        product.name = req.body.name;
        product.price = req.body.price;
        product.image = req.body.image;
        product.category = req.body.category;
        product.brand = req.body.brand;
        product.countInStock = req.body.countInStock;
        product.description = req.body.description;
        const updatedProduct = await product.save();
        res.send({ message: 'Product Updated', product: updatedProduct });
    } else {
        res.status(404).send({ message: 'Product Not Found' });
    }
}));

productRouter.delete('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        const deleteProduct = await product.remove();
        res.send({ message: 'Product Deleted', product: deleteProduct });
    } else {
        res.status(404).send({ message: 'Product Not Found' });
    }
}));

productRouter.post('/:id/reviews', isAuth, expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
        if (product.reviews.find(n => n.name === req.user.name)){
            return res.status(404).send({ message: 'You have already submitted a review' });
        }
        const review = {
            name: req.user.name,
            rating: Number(req.body.rating),
            comment: req.body.comment,
        };
        product.reviews.push(review); //array end
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((a, c) => c.rating + a, 0) / product.reviews.length;
        const updatedProduct = await product.save();
        res.status(201).send({
            message: 'Review Created',
            review: updatedProduct.reviews[updatedProduct.reviews.length - 1] //array end
        });
    } else {
        res.status(404).send({ message: 'Product Not Found' });
    }
}));

export default productRouter;
