import express from 'express';
import path from 'path';

import cookieParser from 'cookie-parser';
import logger from 'morgan';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
// @ts-ignore
import tunnel from 'tunnel-ssh';

import indexRouter from './routes/index';
import usersRouter from './routes/users/UserController';
import postsRouter from './routes/posts/PostController';
import tagsRouter from './routes/tags/TagController';
import auth from './AuthController';

import config from './config';

if (config.sshTunnel) {
    let sshConfig = {
        username: config.sshUsername,
        password: config.sshPassword,
        host: config.sshHost,
        port: config.sshPort,
        dstPort: config.dbPort,
    };

    tunnel(sshConfig, function (error: Error) {
        if (error) {
            console.error(error);
        }
        mongoose.connect('mongodb://' + config.dbHost + '/' + config.dbName);

        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error:'));
        db.once('open', function () {
            // we're connected!
            console.log("DB connection successful");
        });
    });
} else {
    mongoose.connect('mongodb://' + config.dbHost + '/' + config.dbName);
}

const app: express.Application = express();

//Enable cors
app.use(function (_req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token, *");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS, *');
    next();
});

app.use(logger('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', indexRouter);
app.use('/api/v1/', usersRouter);
app.use('/api/v1/', postsRouter);
app.use('/api/v1/', tagsRouter);
app.use('/api/v1/auth', auth);

export default app;
