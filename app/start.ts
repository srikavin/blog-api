#!/usr/bin/env node
import config from './config';
import app from './app';
import {Server} from 'http';
import * as fs from 'fs';
import * as path from 'path';

const debug = require('debug')('blog-backend:server');

let server: Server;
const port = normalizePort(process.env.PORT || '4000');
app.set('port', port);

if (config.https) {
    const https = require('https');
    server = https.createServer({
        key: fs.readFileSync(path.join(__dirname, '..', config.privateKey)),
        cert: fs.readFileSync(path.join(__dirname, '..', config.certificate))
    }, app);
} else {
    const http = require('http');
    server = http.createServer(app);
}

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val: number | any): number | string | boolean {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }

    if (port >= 0) {
        return port;
    }

    return false;
}

function onError(error: any) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
