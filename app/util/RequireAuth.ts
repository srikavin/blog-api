import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

interface AuthInterface extends Request {
    _authInfo: any;
}

export const RequireAuth: MethodDecorator = (_target: Object, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    let oldFunc: Function | undefined = descriptor.value;

    descriptor.value = function (req: Request, res: Response, ...args: any[]) {
        let token = req.headers['x-access-token'] as string;
        let auth = false;

        jwt.verify(token, config.jwtSecret, (err: any, decoded: any) => {
            if (err) {
                auth = false;
                return;
            }

            if (decoded) {
                auth = true;
                (<AuthInterface> req)._authInfo = decoded;
            }
        });

        if (auth && oldFunc) {
            return oldFunc.apply(this, [req, res, ...args]);
        } else {
            res.status(401).send({error: 'Requires authentication'});
            return;
        }


    };

    return descriptor;
};

export function getAuth(req: Request): any {
    return (<AuthInterface> req)._authInfo;
}


