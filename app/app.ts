import express, {Application, Request, Response, Router} from 'express';
import path from 'path';
import config from './config';

import cookieParser from 'cookie-parser';
import logger from 'morgan';

import {UserController} from './routes/users/UserController';
import {PostController} from './routes/posts/PostController';
import {TagController} from './routes/tags/TagController';
import imagesRouter from './routes/images/ImageController';
import filesRouter from './routes/files/FileController';
import auth from './AuthController';
import {SitemapController} from './routes/SitemapController';

const app: Application = express();

app.use(logger('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let userController = new UserController();
userController.init();

let sitemapController = new SitemapController();
sitemapController.init();

let tagController = new TagController();
tagController.init();

let postController = new PostController();
postController.init();

app.use('/api/v1/users', userController.getRouter());
app.use('/api/v1/tags', tagController.getRouter());
app.use('/api/v1/posts', postController.getRouter());
app.use('/api/v1/', imagesRouter);
app.use('/api/v1/', filesRouter);
app.use('/api/v1/', sitemapController.getRouter());
app.use('/api/v1/auth', auth);

let router = Router();
app.use('/', router);

router.get('/api/v1/landing', (_req: Request, res: Response) => {
    if (config.customLandingPage) {
        res.sendFile(path.join(__dirname, '..', config.customLandingPagePath));
    } else {
        res.status(400).send({error: "No landing page exists!"});
    }
});
export default app;
