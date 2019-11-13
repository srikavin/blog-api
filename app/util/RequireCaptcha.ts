import {Request, Response} from 'express';
import config from '../config';
import fetch from 'node-fetch'

export const RequireCaptcha: MethodDecorator = (_target: Object, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    let oldFunc: Function | undefined = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, ...args: any[]) {
        if (!config.useRecaptcha) {
            if (oldFunc) {
                return oldFunc.apply(this, [req, res, ...args]);
            } else {
                res.status(500).send({error: 'Unknown Error'});
                return;
            }
        }

        let token = req.body['g-recaptcha-response'] as string;

        // @ts-ignore
        let remoteIp: string = config.reverseProxy ? req.headers[config.ipHeader] : req.ip;

        const verifyRequest = new URLSearchParams();
        verifyRequest.append('secret', config.recaptchaSecret);
        verifyRequest.append('response', token);
        verifyRequest.append('remoteip', remoteIp);

        console.log(verifyRequest);

        // @ts-ignore
        let response = await (await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            body: verifyRequest
        })).json();

        console.log(verifyRequest);

        console.log(response);

        if (response.success && oldFunc) {
            return oldFunc.apply(this, [req, res, ...args]);
        } else {
            res.status(400).send({error: 'Invalid Recaptcha'});
            return;
        }


    };

    return descriptor;
};

