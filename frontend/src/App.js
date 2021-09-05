import React from 'react';
//https://stackoverflow.com/questions/50807929/how-does-react-router-works-and-what-is-the-difference-between-link-androute/50808647
import {BrowserRouter, Link, Route} from "react-router-dom"; //https://github.com/reactjs/react-router-tutorial/tree/master/lessons
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import RegisterScreen from './screens/RegisterScreen';
import SigninScreen from './screens/SigninScreen';
import { useDispatch, useSelector } from 'react-redux';
import { signout } from './actions/userActions';
import ShippingAddressScreen from './screens/ShippingAddressScreen';


function App() {
  const cart = useSelector(state => state.cart);
  const { cartItems } = cart;
  const userSignin = useSelector(state => state.userSignin);
  const { userInfo } = userSignin;
  const dispatch = useDispatch();
  const signoutHandler = () => {
    dispatch(signout());
  };

  return (
    <BrowserRouter>
      <div className="grid-container">
        <header className="row">
          <div>
            <Link className="brand" to="/">amazona</Link>
          </div>
          <div>
            <Link to="/cart">Cart
            {cartItems.length > 0 && (
              <span className="badge">{cartItems.length}</span>
            )}
            </Link>
            {
              userInfo ? (
                <div className="dropdown">
                  <Link to="#">{userInfo.name} <i className="fa fa-caret-down"></i>{' '}</Link>
                  <ul className="dropdown-content">
                    <li>
                      <Link to="/profile">User Profile</Link>
                    </li>
                    <li>
                      <Link to="/orderhistory">Order History</Link>
                    </li>
                    <li>
                      <Link to="#signout" onClick={signoutHandler}>Sign Out</Link>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link to="/signin">Sign In</Link>
              )
            }
          </div>
        </header>
        <main>
          <Route exact path="/" component={HomeScreen} />
          <Route path="/product/:id" component={ProductScreen} />
          <Route path="/register" component={RegisterScreen} />
          <Route path="/signin" component={SigninScreen} />
          <Route path="/cart/:id?" component={CartScreen} />
          <Route path="/shipping" component={ShippingAddressScreen} />
        </main>
        <footer className="row center">
          <p className="lead">Copyright &copy; 2021 Amazona</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
