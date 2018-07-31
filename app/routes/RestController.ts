import {Document, DocumentQuery, Model, Types} from 'mongoose';
import {Request, RequestHandler, Response, Router} from 'express';
import bodyParser from 'body-parser';

export interface QueryParams<T> {
    limit: number,
    skip: number,
    fields: T
}

interface PopulateType {
    select: string;
    path: string;
}


export abstract class RestController<T extends Schema, M extends Document, F> {
    protected defHandlers: RequestHandler[] = [bodyParser.json(), bodyParser.urlencoded({extended: true})];
    protected router: Router;

    protected constructor() {
        this.router = Router();
    }

    public getRouter(): Router {
        return this.router;
    }

    public init() {
        this.getCommonMiddleware().forEach((e) => this.router.use(e));
        this.defHandlers.forEach((e) => this.router.use(e));
        this.bindMethods();
        this.register(this.router);
    }

    protected abstract register(router: Router): void;

    protected abstract bindMethods(): void;

    protected abstract getModel(): Model<M>;

    protected getCommonMiddleware(): RequestHandler[] {
        return [];
    }

    protected updateEntity(id: Types.ObjectId | string, entity: Partial<T>) {
        return this.getModel().updateOne({
            _id: id
        }, entity);
    }

    protected getEntity(id: Types.ObjectId, populateFields: Array<string | PopulateType> = [],
                        custom: ((a: DocumentQuery<M | null, M>) => DocumentQuery<M | null, M>) = (e) => e) {
        let req = this.getModel().findById(id);
        return custom(this.handlePopulate(populateFields, req)).exec();
    }

    protected getEntities(query: QueryParams<Partial<F>>, populateFields: Array<string | PopulateType> = [], sort: any = {},
                          custom: ((a: DocumentQuery<M[], M>) => DocumentQuery<M[], M>) = (e) => e) {
        let req = this.getModel()
            .find(query.fields)
            .skip(query.skip)
            .limit(query.limit);
        console.log(populateFields);
        return custom(this.handlePopulate(populateFields, req).sort(sort)).exec();
    }

    protected handleQuery(req: Request): QueryParams<Partial<F>> {
        let ret: QueryParams<Partial<F>> = {limit: 50, skip: 0, fields: {}};
        if (req.query.limit) {
            ret.limit = req.query.limit;
        }
        if (req.query.skip) {
            ret.skip = req.query.skip;
        }
        return ret;
    }

    private handlePopulate<A, B extends Document>(fields: Array<string | PopulateType>, query: DocumentQuery<A, B>) {
        fields.forEach(e => {
            console.log(e);
            if (typeof e === 'string') {
                query = query.populate(e);
            } else {
                query = query.populate(e.path, e.select);
            }
        });
        return query;
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
