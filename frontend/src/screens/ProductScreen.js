import React from 'react'
import data from "../data";
import Ratings from '../components/Ratings';
import {Link} from 'react-router-dom';
function ProductScreen(props) {
    //props.match.params.id: user entered in Route path="/product/:id"
    const product = data.products.find(item => item._id === props.match.params.id); 
    //const isMatch = item => item._id === props.match.params.id
    //const product = data.products[data.products.findIndex(isMatch)]
    if(!product){ 
        return <div> Product Not Found! Please Search for Another Product </div>
    }
    return (
        <div>
            <Link to="/">Back</Link>
            <div className="row top">
                <div className="col-2">
                    <img className="large" src={product.image} alt={product.name}/>
                </div>
                <div className="col-1">
                    <ul>
                        <li><h1>{product.name}</h1></li>
                        <li><Ratings rating={product.rating} numReviews={product.numReviews} /></li>
                        <li>Price: {product.price}</li>
                        <li>Description: <p>{product.description}</p></li>
                    </ul>
                </div>
                <div className="col-1">
                    <div className="card card-body">
                        <ul>
                            <li>
                                <div className="row">
                                    <div>Price</div>
                                    <div className="price">${product.price}</div>
                                </div>
                            </li>
                            <li>
                                <div className="row">
                                    <div>Status</div>
                                    <div>
                                    {product.countInStock > 0 ? (
                                        <span className="success">In Stock</span>
                                    ) : (
                                        <span className="danger">Unavailable</span>
                                    )}
                                    </div>
                                </div>
                            </li>
                            <li>
                                <button className="primary block">Add To Cart</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductScreen;
