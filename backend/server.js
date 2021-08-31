import express from 'express'; //"type": "module"; --experimental-modules
import data from './data.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

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
