import config from './../config';

import mongoose from 'mongoose';
// @ts-ignore
import tunnel from 'tunnel-ssh';

export const connection = new Promise(resolve => {
    const dbAuthString = config.dbUseAuth ? `${config.dbUsername}:${config.dbPassword}@` : '';
    const dbScheme = config.dbHostSrv ? 'mongodb+srv://' : 'mongodb://';

    const host = config.dbHostSrv ? config.dbHost : `${config.dbHost}:${config.dbPort}`;

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
            mongoose.connect(`${dbScheme}${dbAuthString}${host}/${config.dbName}`, {useNewUrlParser: true});
        });
    } else {
        mongoose.connect(`${dbScheme}${dbAuthString}${host}/${config.dbName}`, {useNewUrlParser: true});
    }

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'DB connection error:'));
    db.once('open', function () {
        // we're connected!
        console.log('DB connection successful');
        resolve();
    });
});
