import React from 'react'
import data from "../data";
import Products from "../components/Products";
//params => ({foo: "a"}) // returning the object {foo: "a"}
function HomeScreen() {
    return (
      <div>
        <div className="row center">
          {
            data.products.map(product => (
              <Products key={product._id} product={product} />
            ))
          }
        </div>
      </div>
    )
}

export default HomeScreen;
