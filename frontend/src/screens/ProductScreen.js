import React, { useEffect, useState } from 'react';
import LoadingBox from "../components/LoadingBox";
import MessageBox from '../components/MessageBox';
import Ratings from '../components/Ratings';
import { createReview, detailsProduct } from '../actions/productActions';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { PRODUCT_REVIEW_CREATE_RESET } from '../constants/productConstants';
import Modal from 'react-modal';

function ProductScreen(props) { //props: path="/product/:id" in <Route>
    const productId = props.match.params.id; //props.match.params.id: user entered in Route path="/product/:id"
    const [qty, setQty] = useState(1); //onChange
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [issueType, setIssueType] = useState('');
    const [issueDetail, setIssueDetail] = useState('');
    const productDetails = useSelector(state => state.productDetails);
    const {loading, product, error} = productDetails;
    const userSignin = useSelector(state => state.userSignin);
    const { userInfo } = userSignin;
    const productReviewCreate = useSelector(state => state.productReviewCreate);
    const { loading: loadingReviewCreate, error: errorReviewCreate, success: successReviewCreate } = productReviewCreate;
    const dispatch = useDispatch();
    useEffect(() => { 
        if (successReviewCreate) {
            window.alert('Successfully Submitted Review'); //if (window.confirm('Successfully Submitted Review'))
            setRating('');
            setComment('');
            dispatch({ type: PRODUCT_REVIEW_CREATE_RESET });
        }
        dispatch(detailsProduct(productId)) //from actions
    }, [dispatch, productId, successReviewCreate]);
    //https://reactrouter.com/web/api/history
    const addToCart = () => { //move from the current page to another one, change route
        props.history.push(`/cart/${productId}?qty=${qty}`); //Pushes a new entry onto the history stack
    };
    const submitHandler = e => {
        e.preventDefault();
        if (comment && rating) {
            dispatch(createReview(productId, { rating, comment, name: userInfo.name }));
        } else {
            alert('Please enter both comment and rating');
        }
    };
    const submitForm = e => {
        e.preventDefault();
        //send message
    }
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
                <div>
                    <h2 id="reviews">Reviews</h2>
                    {product.reviews.length === 0 //https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/anchor-is-valid.md
                        && (<MessageBox>There is no review</MessageBox>
                    )}
                    <ul>
                        <div className="row start">
                            {product.reviews.map(review => (
                                <li key={review._id} className="review">
                                    <strong>{review.name}</strong>
                                    <Ratings rating={review.rating} caption=" " />
                                    <p>{review.createdAt.substring(0, 10)}</p>
                                    <p>{review.comment}</p>
                                    <p className="f-12">Was this review helpful?</p>
                                    <div>
                                        <i className="fa fa-thumbs-up"></i>{' '}
                                        <i className="fa fa-thumbs-down"></i>{' '}
                                        <button className="modal" onClick={() => setModalIsOpen(true)}>Report</button>
                                        <Modal className="modal-style" isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
                                            <div>
                                                <form className="form" onSubmit={submitForm}>
                                                    <div>
                                                        <div className="row">   
                                                            <h2>Report abuse</h2>
                                                            <button type="button" className="close-btn" onClick={() => setModalIsOpen(false)}><i className="fa fa-close"></i></button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p>Flagged content is reviewed by our admin. If you have a question or technical issue, please contact our Support team.</p>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="issueType">Issue type</label>
                                                        <input type="text" id="issueType" value={issueType} onChange={e => setIssueType(e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="issueDetail">Issue details</label>
                                                        <textarea id="issueDetail" value={issueDetail} onChange={e => setIssueDetail(e.target.value)}/>
                                                    </div>
                                                    <div>
                                                        <label />
                                                        <button className="primary" type="submit">Submit</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </Modal>
                                    </div> 
                                </li>
                            ))}
                        </div>
                        <li>
                            {userInfo ? ( 
                            <form className="form" onSubmit={submitHandler}>
                                <div>
                                    <h2>Write a review</h2>
                                </div>
                                <div>
                                    <label htmlFor="rating">Rating</label>
                                    <select id="rating" value={rating} onChange={e => setRating(e.target.value)}>
                                        <option value="">Select...</option>
                                        <option value="1">1- Poor</option>
                                        <option value="2">2- Fair</option>
                                        <option value="3">3- Good</option>
                                        <option value="4">4- Very good</option>
                                        <option value="5">5- Excellent</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="comment">Comment</label>
                                    <textarea id="comment" value={comment} onChange={e => setComment(e.target.value)}/>
                                </div>
                                <div>
                                    <label />
                                    <button className="primary" type="submit">Submit</button>
                                </div>
                                <div>
                                    {loadingReviewCreate && <LoadingBox />}
                                    {errorReviewCreate && (<MessageBox variant="danger">{errorReviewCreate}</MessageBox>)}
                                </div>
                            </form>
                            ) : (
                            <MessageBox>
                                Please <Link to="/signin">Sign In</Link> to write a review
                            </MessageBox>
                            )}
                        </li>
                    </ul>
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