import express from 'express'; //"type": "module"; --experimental-modules
//import data from './data.js';
import mongoose from 'mongoose';
import userRouter from './routers/userRouter.js';
import productRouter from './routers/productRouter.js';
import orderRouter from './routers/orderRouter.js';
import uploadRouter from './routers/uploadRouter.js';
import dotenv from 'dotenv'; //https://www.npmjs.com/package/dotenv
import path from 'path';

dotenv.config();

const app = express(); //route handler
//middlewares: legacy body-parser
app.use(express.json());
app.use(express.urlencoded({extended: true}));

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/Ecommerce'); //Mongoose 6.0 behaves as if useNewUrlParser, useUnifiedTopology, and useCreateIndex are true
//using routers in the server
app.use('/api/users', userRouter); //userRouter(app)
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/uploads', uploadRouter);
app.get('/api/config/paypal', (req, res) => { //can change to LIVE in paypal dashboard
	res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});
app.get('/api/config/google', (req, res) => {
	res.send(process.env.GOOGLE_API_KEY || '');
});
const __dirname = path.resolve(); //resolve a sequence of path-segments to an absolute path
app.use('/uploads', express.static(path.join(__dirname, '/uploads'))); //concat to /uploads folder; https://nodejs.org/api/path.html#path_path_join_paths
app.use(express.static(path.join(__dirname, '/frontend/build'))); //set files inside git folder
app.get('*', (req, res) =>
	res.sendFile(path.join(__dirname, '/frontend/build/index.html')) //serve all addresses by index.html
);
app.use((err, req, res, next) => { //error catcher middleware
	res.status(500).send({message: err.message}); //server error
});
  
const PORT = process.env.PORT || 5000; //logical OR: when expr1 is falsy, return expr2
app.listen(PORT); //`http://localhost:${PORT}`

/* express 3, static data
app.get('/api/products', (req, res) => { 
    res.send(data.products);
});

app.get('/api/products/:id', (req, res) => {
	const product = data.products.find(item => item._id === req.params.id);
    if(product){
		res.send(product);
	}else{
		res.status(404).send({message: "Product Not Found"});
	}
});

app.get('/', (req, res) => {
   res.send('Server is ready');
});

if(process.env.NODE_ENV === 'production'){
	app.use(express.static('client/build')); 
	const path = require('path');
	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname,'client','build','index.html'));
	});
}
*/
