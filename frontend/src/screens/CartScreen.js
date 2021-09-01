import React from 'react'

function CartScreen(props) { //path="/cart/:id?"
    const productId = props.match.params.id;
    //https://reactrouter.com/web/api/location
    const qty = props.location.search // /cart/${productId}?qty=${qty}
        ? Number(props.location.search.split('=')[1])
        : 1;
    return (
        <div>
            <h1>Cart</h1>
            <p>ID: {productId} QTY:{qty}</p>
        </div>
    )
}

export default CartScreen;
