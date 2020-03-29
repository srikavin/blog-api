import {Request, Response, Router} from 'express';
import {Model} from 'mongoose';

import {IPostModel, Post} from '../../schemas/post/Post';
import {body, param, query} from 'express-validator/check';
import {QueryParams, RestController} from '../RestController';
import {IPost} from '../../schemas/post/IPost';
import {CheckValidation} from '../../util/CheckValidation';
import {checkAuth, getAuth, RequireAuth} from '../../util/RequireAuth';
import {Comment} from "../../schemas/comment/Comment";
import {IComment} from "../../schemas/comment/IComment";
import {RequireCaptcha} from "../../util/RequireCaptcha";
import crypto from 'crypto'

interface PostQuery {
    slug?: string;
    author?: string;
    tags?: any;
    draft?: boolean;
    search?: string;
}

export class PostController extends RestController<IPost, IPostModel, PostQuery> {
    private readonly queryValidators = [
        query('limit').optional().isNumeric(),
        query('skip').optional().isNumeric(),
        query('slug').optional().isString(),
        query('tags').optional().isArray(),
        query('tags.*').optional().isMongoId(),
        query('author').optional().isMongoId(),
        query('search').optional().isString()
    ];

    private readonly createValidators = [
        body('title').exists().isString().withMessage('Must be a string'),
        body('tags').exists().isArray().withMessage('Must be an array'),
        body('tags.*').exists().isMongoId().withMessage('Must be a valid ID'),
        body('contents').exists().isString().withMessage('Must be a string')
    ];

    private readonly updateValidators = [
        param('id').isMongoId().withMessage('Must be valid ID'),
        body('title').optional().isString().withMessage('Must be a string'),
        body('tags').optional().isArray().withMessage('Must be an array'),
        body('tags.*').optional().isMongoId().withMessage('Must be a valid ID'),
        body('contents').optional().isString().withMessage('Must be a string')
    ];

    private readonly newCommentValidators = [
        param('id').isMongoId(),
        body('contents').exists().isString().withMessage("Must be a string"),
        body('email').exists().isEmail().withMessage("Must be a valid Email"),
        body('username').exists().isString().withMessage("Must be a string"),
        body('parent').optional().isMongoId().withMessage("Must be a valid ID")
    ];

    private readonly populateFields = ['tags', {path: 'author', select: 'username}'}];

    constructor() {
        super();
    }

    protected bindMethods() {
        this.getAll = this.getAll.bind(this);
        this.getDrafts = this.getDrafts.bind(this);
        this.getByID = this.getByID.bind(this);
        this.getCommentsById = this.getCommentsById.bind(this);
        this.createNewComment = this.createNewComment.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    protected register(router: Router): void {
        router.get('/', this.queryValidators, this.getAll);
        router.get('/drafts', this.queryValidators, this.getDrafts);
        router.post('/', this.createValidators, this.create);
        router.get('/:id', [param('id').isMongoId()], this.getByID);
        router.get('/:id/comments', [param('id').isMongoId()], this.getCommentsById);
        router.post('/:id/comments/new', this.newCommentValidators, this.createNewComment);
        router.put('/:id', this.updateValidators, this.update);
        router.delete('/:id', [param('id').isMongoId()], this.delete);
    }

    protected handleQuery(req: Request): QueryParams<Partial<PostQuery>> {
        let ret = super.handleQuery(req);

        let {slug, tags, author, search} = req.query;

        if (slug) {
            ret.fields.slug = slug;
        }
        if (tags) {
            ret.fields.tags = {
                $all: tags
            };
        }
        if (author) {
            ret.fields.author = author;
        }

        if (search) {
            // @ts-ignore
            ret.fields.$text = {$search: search};
        }

        if (!checkAuth(req)) {
            ret.fields.draft = false
        } else if (req.query.draft !== undefined) {
            ret.fields.draft = req.query.draft
        }

        return ret;
    }

    @CheckValidation
    @RequireCaptcha
    private createNewComment(req: Request, res: Response) {
        Post.findById(req.params.id).then(e => {
            console.log(1);
            if (e == null) {
                res.status(404).send({error: 'Post does not exist'});
                return;
            }

            let email = req.body.email.trim().toLowerCase();
            let emailHash = crypto.createHash('md5').update(email).digest("hex");

            let gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}.jpg?d=retro`;

            let comment: IComment = {
                contents: req.body.contents,
                email: email,
                gravatarUrl: gravatarUrl,
                parent: req.body.parent,
                post: req.params.id,
                username: req.body.username,
                visible: true
            };

            return Comment.create(comment).then(e => {
                res.send(e);
            }).catch(this.error(res));
        }).catch(this.error(res));
    }

    @CheckValidation
    private getCommentsById(req: Request, res: Response) {
        Comment.find({post: req.params.id, visible: true})
            .sort({createdAt: 'descending'})
            .then(e => res.send(e))
            .catch(this.error(res));
    }

    protected getModel(): Model<IPostModel> {
        return Post;
    }

    @CheckValidation
    private getByID(req: Request, res: Response) {
        this.getEntity(req.params.id, this.populateFields)
            .then(this.sendEntity(res))
            .catch(this.error(res));
    }

    @CheckValidation
    private getAll(req: Request, res: Response) {
        this.getEntities(this.handleQuery(req),
            this.populateFields,
            {'createdAt': 'descending'},
            (e) => req.query.slug || req.query.contents ? e : e.select('-contents')
        )
            .then(this.sendEntities(res))
            .catch(this.error(res));
    }

    @RequireAuth
    @CheckValidation
    private delete(req: Request, res: Response) {
        this.deleteEntity(req.params.id)
            .then(() => {
                res.status(200).send({status: 'success'});
            }).catch(this.error(res));
    }

    @RequireAuth
    @CheckValidation
    private getDrafts(req: Request, res: Response) {
        this.getEntities({...this.handleQuery(req), fields: {...this.handleQuery(req).fields, draft: true}},
            this.populateFields,
            {'createdAt': 'descending'})
            .then(this.sendEntities(res))
            .catch(this.error(res));
    }

    @RequireAuth
    @CheckValidation
    private create(req: Request, res: Response) {
        this.createEntity({
            title: req.body.title,
            author: getAuth(req).id,
            tags: req.body.tags,
            contents: req.body.contents,
            draft: req.body.draft === undefined ? true : req.body.draft
        }).then(e => {
            if (e) {
                e.generateAndUpdateMeta();
                return e.save();
            }
            return Promise.resolve(null);
        })
            .then(this.sendEntity(res))
            .catch(this.error(res));
    }

    @RequireAuth
    @CheckValidation
    private update(req: Request, res: Response) {
        this.getEntity(req.params.id)
            .then(e => {
                if (!e) {
                    return Promise.resolve(null);
                }

                let {slug, overview} = e.generateAndUpdateMeta(req.body.title, req.body.contents);
                let body = {
                    title: req.body.title,
                    tags: req.body.tags,
                    contents: req.body.contents,
                    draft: req.body.draft === undefined ? e.draft : req.body.draft,
                    slug,
                    overview
                };
                return this.updateEntity(req.params.id, body);
            })
            .then(() => this.getEntity(req.params.id))
            .then(this.sendEntity(res))
            .catch(this.error(res));
    }
}
