let overrides = require('../config.json');

interface Config {
    sshTunnel: boolean;
    sshHost: string;
    sshPort: number;
    sshUsername: string;
    sshPassword: string;
    dbHost: string;
    dbPort: number;
    dbName: string;
    dbPassword: string;
    jwtSecret: string;
    maxUsers: number;
}

let defaults = {
// database - tunneling
    'sshTunnel': false,
    'sshHost': '',
    'sshPort': 22,
    'sshUsername': '',
    'sshPassword': '',
// database - login
    'dbHost': 'localhost',
    'dbPort': 27017,
    'dbName': 'db',
    'dbPassword': '',
// jwt
    'jwtSecret': 'jwtsecret',
// app settings
    'maxUsers': 1
};

let config: Config = Object.assign(defaults, overrides);

export default config;