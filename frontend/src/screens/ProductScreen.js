import React,{ useEffect, useState } from 'react'
import LoadingBox from "../components/LoadingBox";
import MessageBox from '../components/MessageBox';
import Ratings from '../components/Ratings';
import { detailsProduct } from '../actions/productActions';
import {Link} from 'react-router-dom';
import {useSelector, useDispatch} from "react-redux";

function ProductScreen(props) {
    const productId = props.match.params.id; //props.match.params.id: user entered in Route path="/product/:id"
    const dispatch = useDispatch();
    const productDetails = useSelector(state => state.productDetails);
    const {loading, product, error} = productDetails;
    useEffect(() => { 
        dispatch(detailsProduct(productId))
    }, [dispatch, productId]);
    return (
        <div>
        {
            loading ? (
            <LoadingBox />
            ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
            ) : (
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
        </div>
        
    )
}

export default ProductScreen;

/* replace to redux store
const product = data.products.find(item => item._id === props.match.params.id); 
const isMatch = item => item._id === props.match.params.id
const product = data.products[data.products.findIndex(isMatch)]
if(!product){ 
    return <div> Product Not Found! Please Search for Another Product </div>
}
*/