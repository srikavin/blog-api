import {NextFunction, Request, Response} from 'express';

export function PublicCache(maxAge = 31557600): MethodDecorator {
    return (_target: Object, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
        let oldFunc: Function | undefined = descriptor.value;

        descriptor.value = function (req: Request, res: Response, ...args: any[]) {
            res.set('Cache-Control', 'public, max-age=' + maxAge);
            if (oldFunc) {
                return oldFunc.apply(this, [req, res, ...args]);
            }
        };

        return descriptor;
    };
}

export const publicCacheMiddleware = (maxAge = 31557600) => {
    return (_: Request, res: Response, next: NextFunction) => {
        res.set('Cache-Control', 'public, max-age=' + maxAge);
        next();
    }
}
