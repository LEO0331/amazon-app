import React from 'react';
import { Link } from 'react-router-dom';
import Ratings from './Ratings';

function Products(props){
    const {product} = props; //const product = props.product
    return(
        <div className="card">
            <Link to={`/product/${product._id}`}>
                <img className="medium" src={product.image} alt={product.name}/>
            </Link>
            <div className="card-body">
                <Link to={`/product/${product._id}`}><h2>{product.name}</h2></Link>
                <Ratings rating={product.rating} numReviews={product.numReviews} />
                <div className="price">{product.price}</div>
            </div>
        </div>
    )
}

export default Products;

/*
go/refresh to <Route path="/product/:id" component={ProductScreen} /> after clicking any product due to <a href={`/product/${product._id}`}><h2>{product.name}</h2></a>
*/