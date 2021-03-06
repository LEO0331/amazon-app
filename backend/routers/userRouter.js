import express from 'express';
import data from '../data.js'; 
import User from '../models/userModel.js';
import expressAsyncHandler from 'express-async-handler'; //https://www.npmjs.com/package/express-async-handler
import bcrypt from 'bcryptjs';
import { generateToken, isAdmin, isAuth } from '../utils.js';

const userRouter = express.Router(); //express 4
userRouter.get('/top-sellers', expressAsyncHandler(async (req, res) => { //https://stackoverflow.com/questions/5825520/in-mongoose-how-do-i-sort-by-date-node-js/15081087#15081087
    const topSellers = await User.find({ isSeller: true }).sort({ 'seller.rating': -1 }).limit(3); //descending
    res.send(topSellers);
}));
  
//Simple middleware for handling exceptions inside of async express routes and passing them to your express error handlers
userRouter.get('/seed', expressAsyncHandler(async (req, res) => {
    await User.remove({}); //remove all users to prevent duplicate errors for initiation
    const createdUsers = await User.insertMany(data.users); //insert object of array in User collection from testing backend
    res.send({createdUsers});
}));

userRouter.post('/signin', expressAsyncHandler(async (req, res) => { //req.body from frontend
    //https://mongoosejs.com/docs/api/model.html#model_Model.findOne
    const user = await User.findOne({email: req.body.email}); //find only one record; no need save() cuz no new user created
    if (user) {
        if (bcrypt.compareSync(req.body.password, user.password)) { //entered compared to hashed pw
            res.send({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isSeller: user.isSeller,
                token: generateToken(user), //generated by JSON Web Token, unique identifier for a specific user
            });
            return;
        }
    }
    res.status(401).send({message: 'Invalid email or password'}); //Unauthorized client error status response code
}));

userRouter.post('/register', expressAsyncHandler(async (req, res) => { //use post() when data can be entered from frontend
    const user = new User({ //req.body was data entered in registerScreen
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    });
    const createdUser = await user.save(); //save() new users when post
    res.send({ //send back to frontend as route '/api/users/register'
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        isAdmin: createdUser.isAdmin,
        isSeller: createdUser.isSeller, //isSeller: user.isSeller
        token: generateToken(createdUser),
    })
}));

userRouter.put('/profile', isAuth, expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id); //req.user._id is available from isAuth
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (user.isSeller) {
            user.seller.name = req.body.sellerName || user.seller.name;
            user.seller.logo = req.body.sellerLogo || user.seller.logo;
            user.seller.description = req.body.sellerDescription || user.seller.description;
        }
        if (req.body.password) { //user new enter pw to replace the old one
            user.password = bcrypt.hashSync(req.body.password, 8);
        }
        const updatedUser = await user.save();
        res.send({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            isSeller: updatedUser.isSeller, //isSeller: user.isSeller
            token: generateToken(updatedUser),
        });
    }
}));
//https://stackoverflow.com/questions/34095126/express-router-id
userRouter.get('/:id', expressAsyncHandler(async (req, res) => { //id is the unique instance field (_id) that is given to each Mongoose model instance by default
    const user = await User.findById(req.params.id);
    if (user) {
        res.send(user);
    } else {
        res.status(404).send({ message: 'User Not Found' });
    }
}));

userRouter.get('/', isAuth, isAdmin, expressAsyncHandler(async (req, res) => { 
    const user = await User.find({});
    res.send(user);
}));

userRouter.delete('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        if (user.email === 'admin@gmail.com') {
            res.status(400).send({ message: 'Can Not Delete Admin User' });
            return;
        }
        const deleteUser = await user.remove();
        res.send({ message: 'User Deleted', user: deleteUser });
    } else {
        res.status(404).send({ message: 'User Not Found' });
    }
}));

userRouter.put('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.isSeller = Boolean(req.body.isSeller); //user.isSeller = req.body.isSeller || user.isSeller;
        user.isAdmin = Boolean(req.body.isAdmin); //user.isAdmin = req.body.isAdmin || user.isAdmin;
        const updatedUser = await user.save();
        res.send({ message: 'User Updated', user: updatedUser });
    } else {
        res.status(404).send({ message: 'User Not Found' });
    }
}));

export default userRouter;
