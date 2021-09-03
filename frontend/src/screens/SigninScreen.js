import React, { useEffect, useState } from 'react';
import LoadingBox from "../components/LoadingBox";
import MessageBox from '../components/MessageBox';
import { signin } from '../actions/userActions';
import { useSelector, useDispatch } from "react-redux";
import { Link } from 'react-router-dom';

function SigninScreen(props) {
    const [email, setEmail] = useState(''); //Hook
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const submitHandler = (e) => { //run when clicking submit button
        e.preventDefault(); //form not refresh, use ajax to signin users instead of refresh to another page
    
    }
    return (
        <div>
            <form className="form" onSubmit={submitHandler}>
                <div>
                    <h1>Sign In</h1>
                </div>
                {loading && <LoadingBox />}
                {error && <MessageBox variant="danger">{error}</MessageBox>}
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" placeholder="Enter email" required onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" placeholder="Enter password" required onChange={e => setPassword(e.target.value)} />
                </div>
                <div>
                    <label />
                    <button className="primary" type="submit">Sign In</button>
                </div>
                <div>
                    <label />
                    <div>   
                        New Customer?{' '}
                        <Link to={`/register`}>Create your account</Link>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default SigninScreen;

/*
https://reactjs.org/docs/forms.html
htmlFor: which form element a label is bound to -> <input> id
*/