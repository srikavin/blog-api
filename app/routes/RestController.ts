import {Document, Model, Types} from 'mongoose';
import {Request, RequestHandler, Response, Router} from 'express';

export interface QueryParams<T> {
    limit: number,
    skip: number,
    fields: T
}


export abstract class RestController<T extends Schema, M extends Document, F> {

    protected router: Router;

    protected constructor(defHandlers: RequestHandler[]) {
        this.router = Router();
        this.getCommonMiddleware().forEach((e) => this.router.use(e));
        defHandlers.forEach((e) => this.router.use(e));
        this.bindMethods();
        this.register(this.router);
    }

    public getRouter(): Router {
        return this.router;
    }

    protected abstract register(router: Router): void;

    protected abstract bindMethods(): void;

    protected abstract getModel(): Model<M>;

    protected getCommonMiddleware(): RequestHandler[] {
        return [];
    }

    protected updateEntity(id: Types.ObjectId | string, entity: T) {
        return this.getModel().updateOne({
            _id: id
        }, entity);
    }

    protected getEntity(id: Types.ObjectId) {
        return this.getModel().findById(id);
    }

    protected getEntities(query: QueryParams<Partial<F>>) {
        return this.getModel().find(query.fields).skip(query.skip).limit(query.limit).exec();
    }

    protected handleQuery(req: Request): QueryParams<Partial<F>> {
        let ret: QueryParams<Partial<F>> = {limit: 50, skip: 0, fields: {}};
        if (req.params.limit) {
            ret.limit = req.params.limit;
        }
        if (req.params.skip) {
            ret.skip = req.params.skip;
        }
        return ret;
    }

    protected createEntity(entity: T) {
        return this.getModel().create(entity);
    }

    protected deleteEntity(id: Types.ObjectId) {
        return this.getModel().deleteOne({
            _id: id
        });
    }

    protected error(res: Response) {
        return function (error: Error) {
            console.error(error);
            res.status(200).send({error: 'Unknown Error'});
        };
    }

    protected sendEntity(res: Response) {
        return function (e: T | null) {
            if (!e) {
                res.status(404).send({error: 'Not found'});
                return;
            }
            res.status(200).send(e);
        };
    }

    protected sendEntities(res: Response) {
        return function (e: T[]) {
            res.status(200).send(e);
        };
    }
}
