import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';

function SellerRoute({ component: Component, ...rest }) { //similar to private route
    const userSignin = useSelector(state => state.userSignin);
    const { userInfo } = userSignin; 
    return ( 
        <Route {...rest} render={props => userInfo && userInfo.isSeller ? (<Component {...props} />) : (<Redirect to="/signin" />)}/>
    );
}

export default SellerRoute;
