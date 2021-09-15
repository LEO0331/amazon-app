import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { detailsUser, updateUserProfile } from '../actions/userActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { USER_UPDATE_PROFILE_RESET } from '../constants/userConstants';

function ProfileScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [sellerName, setSellerName] = useState('');
    const [sellerLogo, setSellerLogo] = useState('');
    const [sellerDescription, setSellerDescription] = useState('');
    const userSignin = useSelector(state => state.userSignin);
    const userDetails = useSelector(state => state.userDetails);
    const userUpdateProfile = useSelector(state => state.userUpdateProfile);
    const { userInfo } = userSignin;
    const { loading, error, user } = userDetails;
    const { success: successUpdate, error: errorUpdate, loading: loadingUpdate } = userUpdateProfile; //rename
    const dispatch = useDispatch();
    useEffect(() => {
        if(!user){
            dispatch({ type: USER_UPDATE_PROFILE_RESET });
            dispatch(detailsUser(userInfo._id));
        } else { //from backend
            setName(user.name);
            setEmail(user.email);
            if (user.seller) {
                setSellerName(user.seller.name);
                setSellerLogo(user.seller.logo);
                setSellerDescription(user.seller.description);
            }
        }
    }, [dispatch, userInfo._id, user]);
    const submitHandler = e => { //update pw
        e.preventDefault();
        if (password !== confirmPassword){
            alert('Password not match');
        } else {
            dispatch(updateUserProfile({
                userId: user._id, name, email, password, sellerName, sellerLogo, sellerDescription
            }))
        }
    }
    return (
        <div>
            <form className="form" onSubmit={submitHandler}>
                <div>
                    <h1>User Profile</h1>
                </div>
                {loading ? ( <LoadingBox />
                ) : error ? ( <MessageBox variant="danger">{error}</MessageBox>
                ) : (
                    <>
                        {loadingUpdate && <LoadingBox />}
                        {errorUpdate && (<MessageBox variant="danger">{errorUpdate}</MessageBox>)}
                        {successUpdate && (<MessageBox variant="success">Successfully Updated Profile</MessageBox>)}
                        <div>
                            <label htmlFor="name">Name</label>
                            <input type="text" id="name" placeholder="Enter name" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" placeholder="Enter password" onChange={e => setPassword(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input type="password" id="confirmPassword" placeholder="Confirm password" onChange={e => setConfirmPassword(e.target.value)} />
                        </div>
                        {user.isSeller && (
                            <>
                                <div>
                                    <h2>Seller</h2>
                                </div>
                                <div>
                                    <label htmlFor="sellerName">Seller Name</label>
                                    <input type="text" id="sellerName" placeholder="Enter Seller Name" value={sellerName} onChange={e => setSellerName(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="sellerLogo">Seller Logo</label>
                                    <input type="text" id="sellerLogo" placeholder="Enter Seller Logo" value={sellerLogo} onChange={e => setSellerLogo(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="sellerDescription">Seller Description</label>
                                    <input type="text" id="sellerDescription" placeholder="Enter Seller Description" value={sellerDescription} onChange={e => setSellerDescription(e.target.value)} />
                                </div>
                            </>
                        )}
                        <div>
                            <label />
                            <button className="primary" type="submit">Update</button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
}

export default ProfileScreen;
