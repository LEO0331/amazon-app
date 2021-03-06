import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'; //https://medium.com/@mendes.develop/introduction-on-react-redux-using-hooks-useselector-usedispatch-ef843f1c2561
import { Link, useParams } from 'react-router-dom';
import { createProduct, deleteProduct, listProducts } from '../actions/productActions';
import { PRODUCT_CREATE_RESET, PRODUCT_DELETE_RESET } from '../constants/productConstants';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

function ProductListScreen(props) {
    const sellerMode = props.match.path.indexOf('/seller') >= 0; // path=/productlist/seller -- T/F
    const { pageNumber = 1 } = useParams();
    const userSignin = useSelector(state => state.userSignin);
    const { userInfo } = userSignin;
    const productList = useSelector(state => state.productList);
    const { loading, error, products, page, pages } = productList;
    const productCreate = useSelector(state => state.productCreate);
    const { loading: loadingCreate, error: errorCreate, success: successCreate, product: createdProduct } = productCreate;
    const productDelete = useSelector(state => state.productDelete);
    const { loading: loadingDelete, error: errorDelete, success: successDelete } = productDelete;
    const dispatch = useDispatch()
    useEffect(() => {
        if (successCreate) {
            dispatch({ type: PRODUCT_CREATE_RESET });
            props.history.push(`/product/${createdProduct._id}/edit`); //redirect to edit screen
        }
        if (successDelete) {
            dispatch({ type: PRODUCT_DELETE_RESET });
        }
        dispatch(listProducts({seller: sellerMode ? userInfo._id : '', pageNumber})); //add new smaple products to generate sellerID and add it to existing products
    }, [createdProduct, dispatch, props.history, successCreate, successDelete, sellerMode, userInfo._id, pageNumber]);
    const createHandler = () => {
        dispatch(createProduct());
    };
    const deleteHandler = (product) => {
        if (window.confirm('Are you sure to delete?')) { //confirm window alert
            dispatch(deleteProduct(product._id));
        }
    }
    return (
        <div>
            <div className="row">
                <h1>Products</h1>
                <button type="button" className="primary" onClick={createHandler}>Create Product</button>
            </div>
            {loadingCreate && <LoadingBox />}
            {errorCreate && <MessageBox variant="danger">{errorCreate}</MessageBox>}
            {loadingDelete && <LoadingBox />}
            {errorDelete && <MessageBox variant="danger">{errorDelete}</MessageBox>}
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
                                        <button type="button" className="small" onClick={() => deleteHandler(product)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="row center pagination">
                        {[...Array(pages).keys()].map(x => ( //convert pages to link; similar format as Qty in productScreen -- implement pages in other listScreen
                            <Link className={x + 1 === page ? 'active' : ''} key={x + 1} to={`/productlist/pageNumber/${x + 1}`}>
                                {x + 1}
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default ProductListScreen;
