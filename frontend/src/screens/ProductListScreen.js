import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { createProduct, deleteProduct, listProducts } from '../actions/productActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

function ProductListScreen(props) {
    const productList = useSelector(state => state.productList);
    const { loading, error, products } = productList;
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(listProducts())
    }, [dispatch])
    const deleteHandler = (product) => {
        if (window.confirm('Are you sure to delete?')) { //confirm window alert
            dispatch(deleteProduct(product._id));
        }
    }
    return (
        <div>
            <div className="row">
                <h1>Products</h1>
            </div>
            {loading ? ( 
                <LoadingBox />
                ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
                ) : (
                <>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>NAME</th>
                                <th>PRICE</th>
                                <th>CATEGORY</th>
                                <th>BRAND</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id}>
                                    <td>{product._id}</td>
                                    <td>{product.name}</td>
                                    <td>{product.price}</td>
                                    <td>{product.category}</td>
                                    <td>{product.brand}</td>
                                    <td>
                                        <button type="button" className="small" onClick={() => {props.history.push(`/product/${product._id}/edit`)}}>Edit</button>
                                    </td>
                                    <td>
                                        <button type="button" className="small" onClick={() => deleteHandler(product)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    )
}

export default ProductListScreen;
