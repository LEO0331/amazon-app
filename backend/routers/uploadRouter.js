import express from 'express';
import multer from 'multer'; //https://www.npmjs.com/package/multer
import { isAuth } from '../utils.js';

const uploadRouter = express.Router();

const storage = multer.diskStorage({ //full control on storing files to disk
    destination(req, file, cb) {
        cb(null, 'uploads/'); //(err, folder to save the file)
    },
    filename(req, file, cb) {
        //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, `${Date.now()}.jpg`); //`${uniqueSuffix}.jpg`
    },
});
  
const upload = multer({ storage });

uploadRouter.post('/', isAuth, upload.single('image'), (req, res) => { //req.body will hold the text fields, if there were any 
    res.send(`/${req.file.path}`); //req.file is the name of file in the form above, here 'image'; full path to the uploaded file
});
  
export default uploadRouter;
