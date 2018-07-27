import {Document, Model, Types} from 'mongoose';
import {RequestHandler, Response, Router} from 'express';

export abstract class RestController<T extends Document> {

    protected router: Router;

    protected constructor(defHandlers: RequestHandler[]) {
        this.router = Router();
        this.getCommonMiddleware().forEach((e) => this.router.use(e));
        defHandlers.forEach((e) => this.router.use(e));
        this.register(this.router);
    }

    public getRouter(): Router {
        return this.router;
    }

    protected abstract register(router: Router): void;

    protected abstract getModel(): Model<T>;

    protected getCommonMiddleware(): RequestHandler[] {
        return [];
    }

    protected updateEntity(id: Types.ObjectId, entity: T) {
        return this.getModel().updateOne({
            _id: id
        }, entity);
    }

    protected getEntity(id: Types.ObjectId) {
        return this.getModel().findById(id);
    }

    protected addEntity(item: T) {
        return this.getModel().create(item);
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

}
