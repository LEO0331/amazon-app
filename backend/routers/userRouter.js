import express from 'express';
import data from '../data.js'; 
import User from '../models/userModel.js';
import expressAsyncHandler from 'express-async-handler'; //https://www.npmjs.com/package/express-async-handler

const userRouter = express.Router(); //express 4
//Simple middleware for handling exceptions inside of async express routes and passing them to your express error handlers
userRouter.get('/seed', expressAsyncHandler(async (req, res) => {
    //await User.remove({}); //remove all users to prevent duplicate errors
    const createdUsers = await User.insertMany(data.users); //insert object of array in User collection
    res.send({createdUsers});
}));

export default userRouter;
