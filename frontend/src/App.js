import React, { Suspense, lazy, useEffect, useState } from 'react';
//https://stackoverflow.com/questions/50807929/how-does-react-router-works-and-what-is-the-difference-between-link-androute/50808647
import {HashRouter, Link, Route} from "react-router-dom"; //https://github.com/reactjs/react-router-tutorial/tree/master/lessons
import { useDispatch, useSelector } from 'react-redux';
import { signout } from './actions/userActions';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import SellerRoute from './components/SellerRoute';
import SearchBox from './components/SearchBox';
import { listProductCategories } from './actions/productActions';
import LoadingBox from './components/LoadingBox';
import MessageBox from './components/MessageBox';
import ChatBox from './components/ChatBox';
import { initializeCsrfToken } from './apiClient';

const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const ProductScreen = lazy(() => import('./screens/ProductScreen'));
const CartScreen = lazy(() => import('./screens/CartScreen'));
const RegisterScreen = lazy(() => import('./screens/RegisterScreen'));
const SigninScreen = lazy(() => import('./screens/SigninScreen'));
const ShippingAddressScreen = lazy(() => import('./screens/ShippingAddressScreen'));
const PaymentMethodScreen = lazy(() => import('./screens/PaymentMethodScreen'));
const PlaceOrderScreen = lazy(() => import('./screens/PlaceOrderScreen'));
const OrderScreen = lazy(() => import('./screens/OrderScreen'));
const OrderHistoryScreen = lazy(() => import('./screens/OrderHistoryScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const ProductListScreen = lazy(() => import('./screens/ProductListScreen'));
const ProductEditScreen = lazy(() => import('./screens/ProductEditScreen'));
const OrderListScreen = lazy(() => import('./screens/OrderListScreen'));
const UserListScreen = lazy(() => import('./screens/UserListScreen'));
const UserEditScreen = lazy(() => import('./screens/UserEditScreen'));
const SellerScreen = lazy(() => import('./screens/SellerScreen'));
const SearchScreen = lazy(() => import('./screens/SearchScreen'));
const DashboardScreen = lazy(() => import('./screens/DashboardScreen'));
const SupportScreen = lazy(() => import('./screens/SupportScreen'));

function App() {
  const cart = useSelector(state => state.cart);
  const { cartItems } = cart;
  const userSignin = useSelector(state => state.userSignin);
  const { userInfo } = userSignin;
  const productCategoryList = useSelector(state => state.productCategoryList);
  const { loading: loadingCategories, error: errorCategories, categories } = productCategoryList;
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(listProductCategories());
    initializeCsrfToken();
  }, [dispatch]);
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSidebarIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);
  const signoutHandler = () => {
    dispatch(signout());
  };
  //history is the prop of react-router-dom obj: https://reactrouter.com/web/api/history
  return ( //https://reactrouter.com/web/api/Route/render-func
    <HashRouter>
      <div className="grid-container">
        <header className="row">
          <div className="header-left">
            <button
              type="button"
              className="open-sidebar"
              aria-controls="main-sidebar"
              aria-expanded={sidebarIsOpen}
              aria-label={sidebarIsOpen ? 'Close categories menu' : 'Open categories menu'}
              onClick={() => setSidebarIsOpen((prev) => !prev)}
            >
              <i className="fa fa-bars"></i>
            </button>
            <Link className="brand" to="/">EShop</Link>
          </div>
          <div className="header-center">
            <Route render={({ history }) => (<SearchBox history={history} />)}/>
          </div>
          <div className="header-right">
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
            {userInfo && userInfo.isSeller && (
              <div className="dropdown">
                <Link to="#admin">Seller <i className="fa fa-caret-down"></i>{' '}</Link>
                <ul className="dropdown-content">
                  <li>
                    <Link to="/productlist/seller">Products</Link>
                  </li>
                  <li>
                    <Link to="/orderlist/seller">Orders</Link>
                  </li>
                </ul>
              </div>
            )}
            {userInfo && userInfo.isAdmin && (
              <div className="dropdown">
                <Link to="#admin">Admin <i className="fa fa-caret-down"></i>{' '}</Link>
                <ul className="dropdown-content">
                  <li>
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/productlist">Products</Link>
                  </li>
                  <li>
                    <Link to="/orderlist">Orders</Link>
                  </li>
                  <li>
                    <Link to="/userlist">Users</Link>
                  </li>
                  <li>
                    <Link to="/support">Support</Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </header>
        <aside id="main-sidebar" className={sidebarIsOpen ? 'open' : ''}>
          <ul className="categories">
            <li>
              <strong>Categories</strong>
              <button
                onClick={() => setSidebarIsOpen(false)}
                className="close-sidebar"
                type="button"
              >
                <i className="fa fa-close"></i>
              </button>
            </li>
            {loadingCategories ? (
              <LoadingBox />
            ) : errorCategories ? (
              <MessageBox variant="danger">{errorCategories}</MessageBox>
            ) : (
              categories.map(c => (
                <li key={c}>
                  <Link to={`/search/category/${c}`} onClick={() => setSidebarIsOpen(false)}>{c}</Link>
                </li>
              ))
            )}
          </ul>
        </aside>
        {sidebarIsOpen && <button type="button" className="sidebar-backdrop" aria-label="Close sidebar" onClick={() => setSidebarIsOpen(false)} />}
        <main>
          <Suspense fallback={<LoadingBox />}>
            <Route exact path="/" component={HomeScreen} />
            <Route exact path="/product/:id" component={ProductScreen} />
            <Route exact path="/product/:id/edit" component={ProductEditScreen} />
            <Route path="/register" component={RegisterScreen} />
            <Route path="/signin" component={SigninScreen} />
            <Route path="/cart/:id?" component={CartScreen} />
            <Route path="/shipping" component={ShippingAddressScreen} />
            <Route path="/payment" component={PaymentMethodScreen} />
            <Route path="/placeorder" component={PlaceOrderScreen} />
            <Route path="/order/:id" component={OrderScreen} />
            <Route path="/orderhistory" component={OrderHistoryScreen} />
            <Route path="/seller/:id" component={SellerScreen} />
            <Route exact path="/search/name/:name?" component={SearchScreen} />
            <Route exact path="/search/category/:category" component={SearchScreen} />
            <Route exact path="/search/category/:category/name/:name" component={SearchScreen} />
            <Route exact path="/search/category/:category/name/:name/min/:min/max/:max/rating/:rating/order/:order/pageNumber/:pageNumber" component={SearchScreen} />
            <PrivateRoute path="/profile" component={ProfileScreen} />
            <AdminRoute exact path="/productlist" component={ProductListScreen} />
            <AdminRoute exact path="/orderlist" component={OrderListScreen} />
            <AdminRoute path="/userlist" component={UserListScreen} />
            <AdminRoute path="/user/:id/edit" component={UserEditScreen} />
            <AdminRoute exact path="/productlist/pageNumber/:pageNumber" component={ProductListScreen} />
            <AdminRoute path="/dashboard" component={DashboardScreen} />
            <AdminRoute path="/support" component={SupportScreen} />
            <SellerRoute path="/productlist/seller" component={ProductListScreen} />
            <SellerRoute path="/orderlist/seller" component={OrderListScreen} />
          </Suspense>
        </main>
        <footer className="row center">
          {userInfo && !userInfo.isAdmin && <ChatBox userInfo={userInfo} />}
          <p className="lead">All right reserved. Copyright &copy; 2021 EShop</p>
        </footer>
      </div>
    </HashRouter>
  );
}

export default App;
