import express from 'express';
import expressAsyncHandler from 'express-async-handler'; //try-catch
import data from '../data.js';
import Product from '../models/productModel.js';
//import User from '../models/userModel.js';

const productRouter = express.Router();

productRouter.get('/', expressAsyncHandler(async (req, res) => { // add to the end: /api/products/ -> exact api frontend send to
    //https://www.geeksforgeeks.org/mongoose-find-function/
    const products = await Product.find({}); //{}: all products
    res.send(products);
}));

productRouter.get('/seed', expressAsyncHandler(async (req, res) => {
    //await Product.remove({});
    //https://www.geeksforgeeks.org/mongoose-insertmany-function/
    const createdProducts = await Product.insertMany(data.products); //insertMany() function is used to insert multiple documents into a collection. It accepts an array of documents to insert into the collection.
    res.send({createdProducts}); //{[{p1},{p2}]}
}));
//put at the end to avoid get '/seed' as id
productRouter.get('/:id', expressAsyncHandler(async (req, res) => { //product details api
    const product = await Product.findById(req.params.id);
    if (product) {
        res.send(product);
    } else {
        res.status(404).send({message: 'Product Not Found'});
    }
    /* https://stackoverflow.com/questions/43055600/app-get-is-there-any-difference-between-res-send-vs-return-res-send
    if (product) {
        return res.send(product);
    }
    res.status(404).send({message: 'Product Not Found'});
    */
}));

export default productRouter;
