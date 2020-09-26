let overrides;

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
    dbHostSrv: boolean;
    dbPort: number;
    dbName: string;
    dbUseAuth: boolean;
    dbUsername: string;
    dbPassword: string;
    jwtSecret: string;
    maxUsers: number;
    customLandingPage: boolean;
    customLandingPagePath: string;
    useRecaptcha: boolean;
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
    'dbHostSrv': false,
    'dbPort': 27017,
    'dbName': 'db',
    'dbUseAuth': false,
    'dbUsername': '',
    'dbPassword': '',
// jwt
    'jwtSecret': 'jwtsecret',
// app settings
    'maxUsers': 1,
    'customLandingPage': false,
    'customLandingPagePath': '',
// recaptcha
    'useRecaptcha': true,
    'recaptchaSecret': '6Lfi7MEUAAAAABFLHK6Inv5kzAYRV2GlfalH5ga_',
// proxy settings
    'reverseProxy': false,
    'ipHeader': 'X-Real-IP'
};

if (process.env.FIREBASE_CONFIG) {
    const firebaseConfig = require('firebase-functions').config().blog_api;

    overrides = {
        dbName: firebaseConfig.db_name,
        dbHostSrv: true,
        dbHost: firebaseConfig.db_host,
        dbUseAuth: true,
        dbUsername: firebaseConfig.db_username,
        dbPassword: firebaseConfig.db_password,

        jwtSecret: firebaseConfig.jwt_secret,

        useRecaptcha: firebaseConfig.use_recaptcha === 'true',
        recaptchaSecret: firebaseConfig.recaptcha_secret,

        maxUsers: 1,
    };
} else {
    overrides = require('../config.json');
}

let config: Config = Object.assign(defaults, overrides);

export default config;
