let overrides = require('../config.json');

interface Config {
    https: boolean;
    privateKey: string;
    certificate: string;
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
    useRecaptcha: true;
    recaptchaSecret: string;
    reverseProxy: boolean;
    ipHeader: string;
}

let defaults = {
// http settings
    'https': false,
    'privateKey': '',
    'certificate': '',
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
    'maxUsers': 1,
    'useRecaptcha': 'true',
    'recaptchaSecret': '6Lfi7MEUAAAAABFLHK6Inv5kzAYRV2GlfalH5ga_',
    'reverseProxy': false,
    'ipHeader': 'X-Real-IP'
};

let config: Config = Object.assign(defaults, overrides);

export default config;