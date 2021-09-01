import React from 'react';
import {BrowserRouter, Link, Route} from "react-router-dom"; //https://github.com/reactjs/react-router-tutorial/tree/master/lessons
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';


function App() {
  return (
    <BrowserRouter>
      <div className="grid-container">
        <header className="row">
          <div>
            <a className="brand" href="/">amazona</a>
          </div>
          <div>
            <a href="/cart">Cart</a>
            <a href="/signin">Sign In</a>
          </div>
        </header>
        <main>
          <Route exact path="/" component={HomeScreen} />
          <Route path="/product/:id" component={ProductScreen} />
          <Route path="/cart/:id?" component={CartScreen}/>
        </main>
        <footer className="row center">
          <p className="lead">Copyright &copy; 2021 Amazona</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
