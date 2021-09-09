import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
//inline rendering and wrapping without the undesired remounting
function PrivateRoute({ component: Component, ...rest }) { //unauthenticated user should not see profile screen
    const userSignin = useSelector(state => state.userSignin);
    const { userInfo } = userSignin; //need login to see this page
    return ( //https://reactrouter.com/web/api/Route/render-func
        <Route {...rest} render={props => userInfo ? (<Component {...props} />) : (<Redirect to="/signin" />)}/>
    );
}

export default PrivateRoute;
