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
    const { name = 'all', category = 'all', min = 0, max = 0, rating = 0, order = 'newest', pageNumber = 1 } = useParams(); //https://reactrouter.com/web/api/Hooks/useparams
    const productList = useSelector(state => state.productList);
    const { loading, error, products, page, pages } = productList;
    const productCategoryList = useSelector(state => state.productCategoryList);
    const { loading: loadingCategories, error: errorCategories, categories } = productCategoryList;
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(listProducts({ // /all&/ return all products
            pageNumber, name: name !== 'all' ? name : '', category: category !== 'all' ? category : '', min, max, rating, order
        }));
    }, [category, dispatch, max, min, name, order, rating, pageNumber]);
    const getFilterUrl = (filter) => {
        const filterPage = filter.page || pageNumber;
        const filterCategory = filter.category || category;
        const filterName = filter.name || name;
        const filterMin = filter.min ? filter.min : filter.min === 0 ? 0 : min;
        const filterMax = filter.max ? filter.max : filter.max === 0 ? 0 : max;
        const filterRating = filter.rating || rating;
        const sortOrder = filter.order || order;
        return `/search/category/${filterCategory}/name/${filterName}/min/${filterMin}/max/${filterMax}/rating/${filterRating}/order/${sortOrder}/pageNumber/${filterPage}`;
    };
    return (
        <div className="search-page">
            <div className="search-toolbar">
                {loading ? (
                    <LoadingBox />
                ) : error ? (
                    <MessageBox variant="danger">{error}</MessageBox>
                ) : (
                    <>
                        <div className="search-results-count">{products.length} Results</div>
                        <div className="search-sort">
                            <label htmlFor="sortOrder">Sort By</label>
                            <select id="sortOrder" className="s-box" value={order} onChange={e => {props.history.push(getFilterUrl({ order: e.target.value }))}}>
                                <option value="newest">Newest Arrivals</option>
                                <option value="toprated">Avg. Customer Reviews</option>
                                <option value="lowest">Price: Low to High</option>
                                <option value="highest">Price: High to Low</option>
                            </select>
                        </div>
                    </>
                )}
            </div>
            <div className="search-layout">
                <div className="search-filters">
                    <section className="filter-card">
                        <h3>Department</h3>
                        {loadingCategories ? (
                            <LoadingBox />
                        ) : errorCategories ? (
                            <MessageBox variant="danger">{errorCategories}</MessageBox>
                        ) : (
                            <ul className="filter-list">
                                <li>
                                    <Link className={`filter-link ${'all' === category ? 'active' : ''}`} to={getFilterUrl({ category: 'all' })}>Any</Link>
                                </li>
                                {categories.map(c => ( //side bar shows categories
                                    <li key={c}>
                                        <Link className={`filter-link ${c === category ? 'active' : ''}`} to={getFilterUrl({ category: c })}>{c}</Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                    <section className="filter-card">
                        <h3>Price</h3>
                        <ul className="filter-list">
                            {prices.map(p => ( //side bar shows prices
                                <li key={p.name}>
                                    <Link className={`filter-link ${`${p.min}-${p.max}` === `${min}-${max}` ? 'active' : ''}`} to={getFilterUrl({ min: p.min, max: p.max })}>{p.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                    <section className="filter-card">
                        <h3>Avg. Customer Review</h3>
                        <ul className="filter-list">
                            {ratings.map(r => ( //side bar shows reviews
                                <li key={r.name}>
                                    <Link className={`filter-link filter-rating-link ${`${r.rating}` === `${rating}` ? 'active' : ''}`} to={getFilterUrl({ rating: r.rating })}>
                                        <Ratings caption={' & up'} rating={r.rating} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
                <div className="search-results-pane">
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
                            <div className="row center pagination">
                            {[...Array(pages).keys()].map(x => ( //convert pages to link; similar format as Qty in productScreen
                                <Link className={x + 1 === page ? 'active' : ''} key={x + 1} to={getFilterUrl({ page: x + 1 })}>
                                    {x + 1}
                                </Link>
                            ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SearchScreen;
