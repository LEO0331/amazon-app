import React, { useEffect } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; //https://github.com/leandrowd/react-responsive-carousel
import { Carousel } from 'react-responsive-carousel'; //https://www.npmjs.com/package/react-responsive-carousel
import Products from "../components/Products";
import LoadingBox from "../components/LoadingBox";
import MessageBox from '../components/MessageBox';
import { useSelector, useDispatch } from "react-redux";
import { listProducts } from '../actions/productActions';
import { listTopSellers } from '../actions/userActions';
import { Link } from 'react-router-dom';

function HomeScreen() {
  const dispatch = useDispatch();
  const productList = useSelector(state => state.productList); //from store to reflect on the view
  const {loading, products, error} = productList; //3 values from productList
  const userTopSellersList = useSelector(state => state.userTopSellersList); //params => ({foo: "a"}); returning the object {foo: "a"}
  const {loading: loadingSellers, error: errorSellers, users: sellers} = userTopSellersList;
  useEffect(() => {
    dispatch(listProducts({})); //return all products without filtering
    dispatch(listTopSellers());
  }, [dispatch]);
  return (
    <div>
      <h2>Top Sellers</h2>
      {loadingSellers ? (
        <LoadingBox />
      ) : errorSellers ? (
        <MessageBox variant="danger">{errorSellers}</MessageBox>
      ) : (
        <>
          {sellers.length === 0 && <MessageBox>No Seller Found</MessageBox>}
          <Carousel showArrows autoPlay showThumbs={false}>
            {sellers.map(seller => (
              <div key={seller._id}>
                <Link to={`/seller/${seller._id}`}>
                  <img src={seller.seller.logo} alt={seller.seller.name} />
                  <p className="legend">{seller.seller.name}</p>
                </Link>
              </div>
            ))}
          </Carousel>
        </>
      )}
      <h2>Featured Products</h2>
      {
        loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <>
            {products.length === 0 && <MessageBox>No Product Found</MessageBox>}
            <div className="row center">
            {products.map(product => (
              <Products key={product._id} product={product} />
            ))}
            </div>
          </>
        )
      }
    </div>
  )
}

export default HomeScreen;

/*
  //https://reactjs.org/docs/hooks-intro.html
  const [products, setProducts] = useState([]); //use state and other React features without writing a class
  const [loading, setLoading] = useState(false); //Update Components
  const [error, setError] = useState(false);
  // Similar to componentDidMount and componentDidUpdate: Data fetching, setting up a subscription, and manually changing the DOM in React components are all examples of side effects
  useEffect(() => {
    // send ajax to backend and fetch products
    const fetchData = async () => {
      try {
        setLoading(true);
        const {data} = await axios.get('/api/products'); //backend array transfer to frontend
        setLoading(false);
        setProducts(data);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);
*/