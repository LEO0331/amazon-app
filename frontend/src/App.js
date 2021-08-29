import React from 'react';
import data from "./data";
import Products from "./components/Products"

function App() {
  return (
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
        <div>
          <div className="row center">
            {
              data.products.map(product => (
                <Products key={product._id} product={product}/>
              ))
            }
          </div>
        </div>
      </main>
      <footer className="row center">
        <p className="lead">Copyright &copy; 2021 Amazona</p>
      </footer>
    </div>
  );
}

export default App;
