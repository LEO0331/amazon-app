import React, { useEffect, useState } from 'react';
import LoadingBox from "../components/LoadingBox";
import MessageBox from '../components/MessageBox';
import Ratings from '../components/Ratings';
import { detailsProduct } from '../actions/productActions';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";

function ProductScreen(props) { //props: path="/product/:id" in <Route>
    const productId = props.match.params.id; //props.match.params.id: user entered in Route path="/product/:id"
    const [qty, setQty] = useState(1); //onChange
    const dispatch = useDispatch();
    const productDetails = useSelector(state => state.productDetails);
    const {loading, product, error} = productDetails;
    useEffect(() => { 
        dispatch(detailsProduct(productId)) //from actions
    }, [dispatch, productId]);
    //https://reactrouter.com/web/api/history
    const addToCart = () => { //move from the current page to another one, change route
        props.history.push(`/cart/${productId}?qty=${qty}`); //Pushes a new entry onto the history stack
    };
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
                                    Seller{' '}
                                    <h2>
                                        <Link to={`/seller/${product.seller._id}`}>{product.seller.seller.name}</Link>
                                    </h2>
                                    <Ratings rating={product.seller.seller.rating} numReviews={product.seller.seller.numReviews} />
                                </li>
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
                                {
                                    product.countInStock > 0 && (
                                        <>
                                        <li>
                                            <div className="row">
                                                <div>Qty</div>
                                                <div>
                                                    <select value={qty} onChange={e => setQty(e.target.value)}>
                                                        { //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/keys
                                                            [...Array(product.countInStock).keys()].map(x => (
                                                                <option key={x+1} value={x+1}>{x+1}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <button onClick={addToCart} className="primary block">Add To Cart</button>
                                        </li>
                                        </>
                                    )
                                }
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

/* 
1. Replace to redux store
const product = data.products.find(item => item._id === props.match.params.id); 
const isMatch = item => item._id === props.match.params.id
const product = data.products[data.products.findIndex(isMatch)]
if(!product){ 
    return <div> Product Not Found! Please Search for Another Product </div>
}

2. https://stackoverflow.com/questions/22876978/loop-inside-react-jsx
[...Array(product.countInStock).keys()].forEach(x => <option key={x+1} value={x+1}>{x+1}</option>)
let op = []
for(let i=0; i<qty; i++){
   op.push(<option key={x+1} value={x+1}>{x+1}</option>)
}
return <select>{op}</select>
*/