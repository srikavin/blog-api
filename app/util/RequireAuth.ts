import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

export const RequireAuth: MethodDecorator = (target: Object, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    let oldFunc: Function | undefined = descriptor.value;

    descriptor.value = (req: Request, res: Response, ...args: any[]) => {
        let token = req.headers['x-access-token'] as string;
        let auth = false;

        jwt.verify(token, config.jwtSecret, (err: any, decoded: any) => {
            if (err) {
                auth = false;
                return;
            }

            if (decoded) {
                auth = true;
            }
        });

        if (auth && oldFunc) {
            return oldFunc.apply(target, [req, res, ...args]);
        } else {
            res.status(401).send({error: 'Requires authentication'});
            return;
        }


    };

    return descriptor;
};


