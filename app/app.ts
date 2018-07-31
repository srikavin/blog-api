import express from 'express';
import path from 'path';

import cookieParser from 'cookie-parser';
import logger from 'morgan';

import {UserController} from './routes/users/UserController';
import {PostController} from './routes/posts/PostController';
import {TagController} from './routes/tags/TagController';
import imagesRouter from './routes/images/ImageController';
import auth from './AuthController';

const app: express.Application = express();

//Enable cors
app.use(function (_req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token, *');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS, *');
    next();
});

app.use(logger('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let userController = new UserController();
userController.init();

let tagController = new TagController();
tagController.init();

let postController = new PostController();
postController.init();

app.use('/api/v1/users', userController.getRouter());
app.use('/api/v1/tags', tagController.getRouter());
app.use('/api/v1/posts', postController.getRouter());
app.use('/api/v1/', imagesRouter);
app.use('/api/v1/auth', auth);

export default app;
