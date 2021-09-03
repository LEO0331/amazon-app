import React, { useEffect, useState } from 'react';
import LoadingBox from "../components/LoadingBox";
import MessageBox from '../components/MessageBox';
import { register } from '../actions/userActions';
import { useSelector, useDispatch } from "react-redux";
import { Link } from 'react-router-dom';

function RegisterScreen(props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const redirect = props.location.search ? props.location.search.split('=')[1] : '/';
    const userRegister = useSelector(state => state.userRegister);
    const { userInfo, loading, error } = userRegister;
    const dispatch = useDispatch();
    const submitHandler = (e) => { //run when clicking submit button
        e.preventDefault(); //form not refresh, use ajax to signin users instead of refresh to another page
        if (password !== confirmPassword){
            alert('Password not match');
        }else{
            dispatch(register(name, email, password)); //userinfo contains values after this action
        }
    };
    useEffect(() => {
        if (userInfo) { //success login
          props.history.push(redirect); // /register?redirect=shipping
        }
    }, [props.history, redirect, userInfo]); //dependencies

    return (
        <div>
            <form className="form" onSubmit={submitHandler}>
                <div>
                    <h1>Create Account</h1>
                </div>
                {loading && <LoadingBox />}
                {error && <MessageBox variant="danger">{error}</MessageBox>}
                <div>
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" placeholder="Enter name" required onChange={e => setName(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" placeholder="Enter email" required onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" placeholder="Enter password" required onChange={e => setPassword(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" placeholder="Confirm password" required onChange={e => setConfirmPassword(e.target.value)} />
                </div>
                <div>
                    <label />
                    <button className="primary" type="submit">Register</button>
                </div>
                <div>
                    <label />
                    <div>   
                        Already have an account?{' '}
                        <Link to={`/signin?redirect=${redirect}`}>Sign in</Link>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default RegisterScreen;

/*
https://reactjs.org/docs/forms.html
htmlFor: which form element a label is bound to -> <input> id
*/