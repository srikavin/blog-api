const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('./config');

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

const User = require('./model/user/User');

router.post('/register', function (res, req) {
    let hashedPassword = bcrypt.hashSync(req.body.password, 8);

    User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        }, function (err, user) {
            if (err) {
                return res.status(500).send("There was a problem registering the user.")
            }

            const token = jwt.sign({id: user._id}, config.jwtSecret, {
                expiresIn: 86400
            });

            res.status(200).send({auth: true, token: token});
        }
    )
});

router.get('/me', function (req, res) {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({auth: false, message: 'No token provided.'});

    jwt.verify(token, config.jwtSecret, function (err, decoded) {
        if (err) {
            return res.status(500).send({auth: false, message: 'Failed to authenticate token.'});
        }

        res.status(200).send(decoded);
    });
});

module.exports = router;