import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Products from "../components/Products";
import LoadingBox from "../components/LoadingBox";
import MessageBox from '../components/MessageBox';

//params => ({foo: "a"}); returning the object {foo: "a"}
function HomeScreen() {
  //https://reactjs.org/docs/hooks-intro.html
  const [products, setProducts] = useState([]); //use state and other React features without writing a class
  const [loading, setLoading] = useState(false);
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
  return (
    <div>
      {
        loading ? (
        <LoadingBox />
        ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <div className="row center">
          {
            products.map(product => (
              <Products key={product._id} product={product} />
            ))
          }
          </div>
        )
      }

    </div>
  )
}

export default HomeScreen;
