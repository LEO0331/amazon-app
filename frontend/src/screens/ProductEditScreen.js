import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { detailsProduct, updateProduct } from '../actions/productActions';
import { PRODUCT_UPDATE_RESET } from '../constants/productConstants';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

function ProductEditScreen(props) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState('');
    const [brand, setBrand] = useState('');
    const [description, setDescription] = useState('');
    const productId = props.match.params.id;
    const productDetails = useSelector(state => state.productDetails);
    const { loading, error, product } = productDetails;
    const productUpdate = useSelector(state => state.productUpdate);
    const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = productUpdate;
    const dispatch = useDispatch();
    useEffect(() => {
        if (successUpdate) {
            props.history.push('/productlist');
        }
        if (!product || product._id !== productId || successUpdate) { //product._id !== productId/successUpdate avoid previous product info loaded
            dispatch({ type: PRODUCT_UPDATE_RESET }); 
            dispatch(detailsProduct(productId)); //load from backend; sample product
        } else {
            setName(product.name);
            setPrice(product.price);
            setImage(product.image);
            setCategory(product.category);
            setBrand(product.brand);
            setCountInStock(product.countInStock);
            setDescription(product.description);
        }
    }, [product, dispatch, productId, successUpdate, props.history]);
    const submitHandler = (e) => {
        e.preventDefault(); //dispatch update product
        dispatch(updateProduct({_id: productId, name, price, image, category, brand, countInStock, description}));
    }
    return (
        <div>
            <form className="form" onSubmit={submitHandler}>
                <div>
                    <h1>Edit Product {productId}</h1>
                </div>
                {loadingUpdate && <LoadingBox />}
                {errorUpdate && <MessageBox variant="danger">{errorUpdate}</MessageBox>}
                {loading ? (
                    <LoadingBox />
                ) : error ? (
                    <MessageBox variant="danger">{error}</MessageBox>
                ) : (
                    <>
                        <div>
                            <label htmlFor="name">Name</label>
                            <input type="text" id="name" placeholder="Enter name" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="price">Price</label>
                            <input type="text" id="price" placeholder="Enter price" value={price} onChange={e => setPrice(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="image">Image</label>
                            <input type="text" id="image" placeholder="Enter image" value={image} onChange={e => setImage(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="category">Category</label>
                            <input type="text" id="category" placeholder="Enter category" value={category} onChange={e => setCategory(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="brand">Brand</label>
                            <input type="text" id="brand" placeholder="Enter brand" value={brand} onChange={e => setBrand(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="countInStock">Count In Stock</label>
                            <input type="text" id="countInStock" placeholder="Enter countInStock" value={countInStock} onChange={e => setCountInStock(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="description">Description</label>
                            <textarea type="text" id="description" rows="2" placeholder="Enter description" value={description} onChange={e => setDescription(e.target.value)} />
                        </div>
                        <div>
                            <label />
                            <button className="primary" type="submit">Update</button>
                        </div>
                    </>
                )}
            </form>
        </div>
    )
}

export default ProductEditScreen;
