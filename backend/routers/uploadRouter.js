import express from 'express';
import multer from 'multer'; //https://www.npmjs.com/package/multer
import { isAuth } from '../utils.js';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();
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
  
aws.config.update({
    accessKeyId: process.env.accessKeyId || 'accessKeyId',
    secretAccessKey: process.env.secretAccessKey || 'secretAccessKey'
});
const s3 = new aws.S3();
const storageS3 = multerS3({
    s3,
    bucket: 'amazona-ecommerce-bucket-1',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key(req, file, cb) {
        cb(null, file.originalname);
    }
});
const uploadS3 = multer({ storage: storageS3 });
uploadRouter.post('/s3', uploadS3.single('image'), (req, res) => {
    res.send(req.file.location);
});

export default uploadRouter;

/*
import dotenv from 'dotenv';
dotenv.config();
export default {
  PORT: process.env.PORT || 5000,
  MONGODB_URL: process.env.MONGODB_URL || 'mongodb://localhost/amazona',
  JWT_SECRET: process.env.JWT_SECRET || 'somethingsecret',
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || 'sb',
  accessKeyId: process.env.accessKeyId || 'accessKeyId',
  secretAccessKey: process.env.secretAccessKey || 'secretAccessKey',
};
*/