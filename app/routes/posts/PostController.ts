import {Request, Response, Router} from "express";
import mongoose from "mongoose";

import {Post} from "../../schemas/post/Post";
import {body, param, query, validationResult} from "express-validator/check";
import {auth} from "../../middle/auth";

const router = Router();

interface PostQuery {
    slug?: string,
    author?: string,
}

router.get('/posts/', [
        query('limit').optional().isNumeric(),
        query('skip').optional().isNumeric()
    ],
    (req: Request, res: Response) => {
        let query: PostQuery = {};
        const slug = req.query.slug;
        if (slug) {
            query.slug = slug;
        }

        //Limit max request to 50
        let limit = Math.min((req.query.limit || 25), 50);
        let skip = req.query.skip || 0;

        Post.find(query)
            .populate('author', 'username')
            .populate('tags')
            .limit(limit)
            .skip(skip)
            .sort({createdAt: 'descending'})
            .exec()
            .then((post?) => {
                if (post) {
                    return res.status(200).send(post);
                }
                return res.status(404).send({error: 'No posts found'});
            })
            .catch(err => {
                console.log(err);
                res.status(500).send({error: 'Unknown error occurred'});
            });
    });

const postValidators = [
    auth({output: true, continue: false}),
    body('title').exists().isString().withMessage("Must be a string"),
    body('author').exists().isMongoId().withMessage("Must be a valid user id"),
    body('tags').exists().isArray().withMessage("Must be an array"),
    body('tags.*').exists().isMongoId().withMessage("Must be a valid ID"),
    body('contents').exists().isString().withMessage("Must be a string")
];

router.put('/posts/:id', [
        auth({output: true, continue: false}),
        param('id').isMongoId().withMessage("Must be valid ID"),
        body('title').optional().isString().withMessage("Must be a string"),
        body('author').optional().isMongoId().withMessage("Must be a valid user id"),
        body('tags').optional().isArray().withMessage("Must be an array"),
        body('tags.*').optional().isMongoId().withMessage("Must be a valid ID"),
        body('contents').optional().isString().withMessage("Must be a string")
    ],
    (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        Post.findOne({
            _id: req.params.id
        }).then((e) => {
            if (!e) {
                res.status(404).send({success: false, error: 'Could not find post'});
                return;
            }

            let {slug, overview} = e.generateAndUpdateMeta(req.body.title, req.body.contents);

            let body = {
                title: req.body.title,
                author: req.body.author,
                tags: req.body.tags,
                contents: req.body.contents,
                slug,
                overview
            };

            e.update(body).then(() => {
                res.status(201).send(e);
            });
        }).catch(e => {
            console.log(e);
            res.status(500).send({success: false});
        });
    });

router.post('/posts', postValidators,
    (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        Post.create({
            title: req.body.title,
            author: req.body.author,
            tags: req.body.tags,
            contents: req.body.contents
        }).then(e => {
            e.generateAndUpdateMeta();
            e.save(() => {
                res.status(200).send(e)
            });
        });
    });

router.get('/posts/:id', (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send({error: "Invalid id"});
    }
    Post.findOne({_id: req.params.id})
        .populate('tags')
        .populate('author', 'username').exec()
        .then((post?) => {
            if (!post) {
                return res.status(404).send({error: 'Post not found'});
            }
            return res.status(200).send(post);
        })
        .catch((err: any) => {
            console.log(err);
            return res.status(500).send({error: 'Unknown error'});
        });
});

export default router;
