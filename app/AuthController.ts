import {Request, Response, Router} from "express";
import jwt, {VerifyErrors} from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {check, validationResult} from "express-validator/check";

import config from "./config";

import {IUserModel, User} from "./schemas/user/User";

const router = Router();

router.post('/register', [
    check('username').trim().isLength({min: 5, max: 18}).withMessage('Must be between 5 and 18 characters')
        .isAlphanumeric().withMessage('Must be alphanumeric')
        .custom((value) => {
            return new Promise((resolve, reject) => {
                User.findOne({username: value}, function (err, user) {
                    if (err) {
                        reject()
                    }
                    if (user) {
                        reject()
                    }
                    resolve(true)
                });
            });
        }).withMessage("Username is in use"),
    check('password').isLength({min: 6}).withMessage('Must be at least 6 characters'),
    check('email').isEmail().withMessage('Must be a valid email').normalizeEmail()
        .custom((value) => {
            return new Promise((resolve, reject) => {
                User.findOne({email: value}, function (err, user) {
                    if (err) {
                        reject()
                    }
                    if (user) {
                        reject()
                    }
                    resolve(true)
                });
            });
        }).withMessage("Email is in use"),
], function (req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    let hashedPassword = bcrypt.hashSync(req.body.password, 8);

    User.create({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
    }).then((user: IUserModel) => {
        const token = jwt.sign({id: user._id}, config.jwtSecret, {
            expiresIn: 86400
        });

        res.status(200).send({auth: true, token: token});
    }).catch((err) => {
        console.log(err);
        res.status(500).send({auth: false, message: 'There was a problem registering the user.'});
    });
});

router.get('/me', (req: Request, res: Response) => {
    const token: string = req.headers['x-access-token'] as string;
    if (!token) {
        return res.status(401).send({auth: false, message: 'No token provided.'});
    }

    jwt.verify(token, config.jwtSecret, function (err: VerifyErrors) {
        if (err) {
            res.status(200).send({auth: false, message: 'Failed to authenticate token.'});
            return;
        }

        res.status(200).send({auth: true, token: token});
    });
});

router.post('/login', [
    check('email').exists(),
    check('password').exists()
], (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    User.findOne({email: req.body.email}).select('+password').exec(function (err, user) {
        if (err) {
            console.log(err);
            return res.status(500).send({auth: false, message: 'Unknown error'});
        }
        if (!user || !user.password) {
            return res.status(401).send({auth: false, token: null});
        }

        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (passwordIsValid !== true) {
            return res.status(401).send({auth: false, token: null});
        }

        const token = jwt.sign({id: user._id}, config.jwtSecret, {
            expiresIn: 86400
        });

        res.status(200).send({auth: true, token: token});
    });
});

export default router;
