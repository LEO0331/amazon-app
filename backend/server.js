import express from 'express'; //"type": "module"; --experimental-modules
//import data from './data.js';
import mongoose from 'mongoose';
import userRouter from './routers/userRouter.js';
import productRouter from './routers/productRouter.js';

const app = express(); //route handler

app.use(express.json());
app.use(express.urlencoded({extended: true}));

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/Ecommerce'); //Mongoose 6.0 behaves as if useNewUrlParser, useUnifiedTopology, and useCreateIndex are true
//using routers in the server
app.use('/api/users', userRouter); //userRouter(app)
app.use('/api/products', productRouter);
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
*/
app.get('/', (req, res) => {
   res.send('Server is ready');
});

app.use((err, req, res, next) => { //error catcher middleware
	res.status(500).send({message: err.message}); //server error
});
  
const PORT = process.env.PORT || 5000; //logical OR: when expr1 is falsy, return expr2
app.listen(PORT); //`http://localhost:${PORT}`

/*
if(process.env.NODE_ENV === 'production'){
	app.use(express.static('client/build')); 
	const path = require('path');
	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname,'client','build','index.html'));
	});
}
*/
