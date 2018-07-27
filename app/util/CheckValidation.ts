import {Request, Response} from 'express';
import {validationResult} from 'express-validator/check';

export const CheckValidation: MethodDecorator = (target: Object, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    let oldFunc: Function | undefined = descriptor.value;

    descriptor.value = (req: Request, res: Response, ...args: any[]) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        if (oldFunc) {
            return oldFunc.apply(target, [req, res, ...args]);
        }
    };

    return descriptor;
};


