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
/*
https://stackoverflow.com/questions/43484302/what-does-rest-mean-in-react-jsx
const PrivateRoute = ({ component: Component, ...rest }) => ( //XXscreen; rest: path
  <Route {...rest} render={props => (
    fakeAuth.isAuthenticated ? (
      <Component {...props}/>
    ) : (
      <Redirect to={{
        pathname: '/login',
        state: { from: props.location }
      }}/>
    )
  )}/>
)
Operation 1: Find the component property defined on props (Note: lowercase component) and assign it to a new location in state we call Component (Note: capital Component).
Operation 2: Then, take all remaining properties defined on the props object and collect them inside an argument called rest.
*/