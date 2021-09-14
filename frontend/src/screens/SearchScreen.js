import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { listProducts } from '../actions/productActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Products from '../components/Products';
import Ratings from '../components/Ratings';
import { prices, ratings } from '../utils';

function SearchScreen(props) { // /search/name/${name}
    const { name = 'all', category = 'all', min = 0, max = 0, rating = 0, order = 'newest' } = useParams(); //https://reactrouter.com/web/api/Hooks/useparams
    const productList = useSelector(state => state.productList);
    const { loading, error, products } = productList;
    const productCategoryList = useSelector(state => state.productCategoryList);
    const { loading: loadingCategories, error: errorCategories, categories } = productCategoryList;
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(listProducts({ // /all&/ return all products
            name: name !== 'all' ? name : '', category: category !== 'all' ? category : '', min, max, rating, order
        }));
    }, [category, dispatch, max, min, name, order, rating]);
    const getFilterUrl = (filter) => {
        const filterCategory = filter.category || category;
        const filterName = filter.name || name;
        const filterMin = filter.min ? filter.min : filter.min === 0 ? 0 : min;
        const filterMax = filter.max ? filter.max : filter.max === 0 ? 0 : max;
        const filterRating = filter.rating || rating;
        const sortOrder = filter.order || order;
        return `/search/category/${filterCategory}/name/${filterName}/min/${filterMin}/max/${filterMax}/rating/${filterRating}/order/${sortOrder}`;
    };
    return (
        <div>
            <div className="row">
                {loading ? (
                    <LoadingBox />
                ) : error ? (
                    <MessageBox variant="danger">{error}</MessageBox>
                ) : (
                    <div>
                        <div>{products.length} Results</div>
                        <div>
                            <select className="s-box" value={order} onChange={e => {props.history.push(getFilterUrl({ order: e.target.value }))}}>
                                <option value="newest">Newest Arrivals</option>
                                <option value="toprated">Avg. Customer Reviews</option>
                                <option value="lowest">Price: Low to High</option>
                                <option value="highest">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
            <div className="row top">
                <div className="col-1">
                    <h3>Department</h3>
                    <div>
                        {loadingCategories ? (
                            <LoadingBox />
                        ) : errorCategories ? (
                            <MessageBox variant="danger">{error}</MessageBox>
                        ) : (
                            <ul>
                                <li>
                                    <Link className={'all' === category ? 'active' : ''} to={getFilterUrl({ category: 'all' })}>Any</Link>
                                </li>
                                <li>
                                    {categories.map(c => ( //side bar shows categories
                                        <li key={c}>
                                            <Link className={c === category ? 'active' : ''} to={getFilterUrl({ category: c })}>{c}</Link>
                                        </li>
                                    ))}
                                </li>
                            </ul>
                        )}
                    </div>
                    <div>
                        <h3>Price</h3>
                        <ul>
                            {prices.map(p => ( //side bar shows prices
                                <li key={p.name}>
                                    <Link className={`${p.min}-${p.max}` === `${min}-${max}` ? 'active' : ''} to={getFilterUrl({ min: p.min, max: p.max })}>{p.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3>Avg. Customer Review</h3>
                        <ul>
                            {ratings.map(r => ( //side bar shows reviews
                                <li key={r.name}>
                                    <Link className={`${r.rating}` === `${rating}` ? 'active' : ''} to={getFilterUrl({ rating: r.rating })}>
                                        <Ratings caption={' & up'} rating={r.rating} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="col-3 c-2 c-1">
                    {loading ? (
                        <LoadingBox />
                    ) : error ? (
                        <MessageBox variant="danger">{error}</MessageBox>
                    ) : (
                        <>
                            {products.length === 0 && (<MessageBox>No Product Found</MessageBox>)}
                            <div className="row center">
                                {products.map(product => (<Products key={product._id} product={product} />))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SearchScreen;
