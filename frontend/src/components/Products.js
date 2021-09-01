import React from 'react';
import Ratings from './Ratings';

function Products(props){
    const {product} = props; //const product = props.product
    return(
        <div className="card">
            <a href={`/product/${product._id}`}>
                <img className="medium" src={product.image} alt={product.name}/>
            </a>
            <div className="card-body">
                <a href={`/product/${product._id}`}><h2>{product.name}</h2></a>
                <Ratings rating={product.rating} numReviews={product.numReviews} />
                <div className="price">{product.price}</div>
            </div>
        </div>
    )
}

export default Products;

/*
go to <Route path="/product/:id" component={ProductScreen} /> after clicking any product due to <a href={`/product/${product._id}`}><h2>{product.name}</h2></a>
*/