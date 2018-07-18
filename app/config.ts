let overrides = require('../config.json');

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
};

let config = Object.assign(defaults, overrides);

export default config;