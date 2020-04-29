import {Request, Response, Router} from 'express';
import {Model} from 'mongoose';

import {ITagModel, Tag} from '../../schemas/tag/Tag';
import {body, param} from 'express-validator/check';
import {QueryParams, RestController} from '../RestController';
import {CheckValidation} from '../../util/CheckValidation';
import {RequireAuth} from '../../util/RequireAuth';
import {ITag} from '../../schemas/tag/ITag';
import {PublicCache} from "../../util/PublicCache";

interface TagFields {
    _id: string
    name: string,
}

export class TagController extends RestController<ITag, ITagModel, TagFields> {
    private readonly queryValidators = [
        param('id').optional().isMongoId(),
        param('name').optional().isString()
    ];

    constructor() {
        super();
    }

    protected bindMethods(): void {
        this.getAll = this.getAll.bind(this);
        this.getByID = this.getByID.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    protected register(router: Router) {
        router.get('/', this.queryValidators, this.getAll);
        router.get('/:id', [param('id').isMongoId()], this.getByID);
        router.post('/', [body('name').isString()], this.create);
        router.put('/:id', [body('name').isString(), param('id').isMongoId()], this.update);
        router.delete('/:id', [param('id').isMongoId()], this.delete);
    }

    protected getModel(): Model<ITagModel> {
        return Tag;
    }

    protected handleQuery(req: Request): QueryParams<Partial<TagFields>> {
        let ret = super.handleQuery(req);

        if (req.params.id) {
            ret.fields._id = req.params.id;
        }
        if (req.params.name) {
            ret.fields.name = req.params.name;
        }

        return ret;
    }

    @PublicCache(43200)
    @CheckValidation
    private getAll(req: Request, res: Response) {
        this.getEntities(this.handleQuery(req))
            .then(this.sendEntities(res))
            .catch(this.error(res));
    }

    @PublicCache()
    @CheckValidation
    private getByID(req: Request, res: Response) {
        this.getEntity(req.params.id)
            .then(this.sendEntity(res))
            .catch(this.error(res));
    }

    @RequireAuth
    @CheckValidation
    private create(req: Request, res: Response) {
        this.createEntity({
            name: req.body.name
        })
            .then(this.sendEntity(res))
            .catch(this.error(res));
    }

    @RequireAuth
    @CheckValidation
    private update(req: Request, res: Response) {
        this.updateEntity(req.params.id, {
            name: req.body.name
        })
            .then(() => this.getEntity(req.params.id))
            .then(this.sendEntity(res))
            .catch(this.error(res));
    }

    @RequireAuth
    @CheckValidation
    private delete(req: Request, res: Response) {
        this.deleteEntity(req.params.id)
            .then(() => res.status(200).send({success: true}))
            .catch(this.error(res));
    }
}
