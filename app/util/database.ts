import config from './../config';

import mongoose from 'mongoose';
// @ts-ignore
import tunnel from 'tunnel-ssh';

export const connection = new Promise(resolve => {
    if (config.sshTunnel) {
        let sshConfig = {
            username: config.sshUsername,
            password: config.sshPassword,
            host: config.sshHost,
            port: config.sshPort,
            dstPort: config.dbPort
        };

        tunnel(sshConfig, function (error: Error) {
            if (error) {
                console.error(error);
            }
            mongoose.connect('mongodb://' + config.dbHost + '/' + config.dbName);
        });
    } else {
        mongoose.connect('mongodb://' + config.dbHost + '/' + config.dbName);
    }

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'DB connection error:'));
    db.once('open', function () {
        // we're connected!
        console.log('DB connection successful');
        resolve();
    });
});
