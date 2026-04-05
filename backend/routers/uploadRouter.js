import express from 'express';
import multer from 'multer'; //https://www.npmjs.com/package/multer
import { isAuth } from '../utils.js';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
dotenv.config();
const uploadRouter = express.Router();
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function imageFileFilter(_req, file, cb) {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    cb(new Error('Only image uploads are allowed'));
    return;
  }
  cb(null, true);
}

const storage = multer.diskStorage({ //full control on storing files to disk
    destination(req, file, cb) {
        cb(null, 'uploads/'); //(err, folder to save the file)
    },
    filename(req, file, cb) {
        //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, `${Date.now()}.jpg`); //`${uniqueSuffix}.jpg`
    },
});
  
const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: imageFileFilter,
});

uploadRouter.post('/', isAuth, upload.single('image'), (req, res) => { //req.body will hold the text fields, if there were any 
    res.send(`/${req.file.path}`); //req.file is the name of file in the form above, here 'image'; full path to the uploaded file
});

const hasS3Config =
  Boolean(process.env.AWS_ACCESS_KEY_ID) &&
  Boolean(process.env.AWS_SECRET_ACCESS_KEY) &&
  Boolean(process.env.AWS_S3_BUCKET);

if (hasS3Config) {
  aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  });
  const s3 = new aws.S3();
  const storageS3 = multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key(req, file, cb) {
      const extension = file.originalname.split('.').pop();
      cb(null, `${randomUUID()}.${extension}`);
    },
  });
  const uploadS3 = multer({
    storage: storageS3,
    limits: { fileSize: MAX_UPLOAD_BYTES },
    fileFilter: imageFileFilter,
  });
  uploadRouter.post('/s3', isAuth, uploadS3.single('image'), (req, res) => {
    res.send(req.file.location);
  });
} else {
  uploadRouter.post('/s3', isAuth, (_req, res) => {
    res.status(503).send({ message: 'S3 upload is not configured' });
  });
}

export default uploadRouter;
