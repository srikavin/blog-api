import {Request, RequestHandler} from 'express';
import jwt from "jsonwebtoken";
import config from "../config";

interface AuthMiddlewareOptions {
    /**
     * Outputs a json object to the request if the request is not authenticated
     */
    output?: boolean,
    /**
     * Whether or not to call the function if unauthenticated
     */
    continue?: boolean
}

export interface AuthRequest extends Request {
    authenticated: boolean;
    userID: string;
}

interface JWTVerifyResult {
    id: string;
}

export function auth(options: AuthMiddlewareOptions): RequestHandler {
    //Set defaults
    options.output = options.output || false;
    options.continue = options.continue !== undefined ? options.continue : true;
    return function (req, res, next) {
        let request = req as AuthRequest;

        request.authenticated = false;


        let token = req.headers['x-access-token'] as string;

        jwt.verify(token, config.jwtSecret, (err: any, decoded: any) => {
            if (err) {
                request.authenticated = false;
                return;
            }

            request.authenticated = true;
            request.userID = (<JWTVerifyResult> decoded).id;
        });

        if (!request.authenticated) {
            if (options.output) {
                res.status(401).send({error: "Requires authentication"});
            }
            if (options.continue) {
                next();
            }
            return;
        }

        next();
    }
}