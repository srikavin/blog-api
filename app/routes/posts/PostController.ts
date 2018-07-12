import {Request, Response, Router} from "express";
import mongoose from "mongoose";

import {Post} from "../../schemas/post/Post";
import {body, param, validationResult} from "express-validator/check";
import {auth} from "../../middle/auth";

const router = Router();

interface PostQuery {
    slug?: string,
    author?: string,
}

router.get('/posts/', (req, res) => {
    let query: PostQuery = {};
    const slug = req.query.slug;
    if (slug) {
        query.slug = slug;
    }

    console.log(query);

    Post.find(query)
        .populate('author', 'username')
        .populate('tags').exec()
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
    body('overview').exists().isString().withMessage("Must be a string"),
    body('tags').exists().isArray().withMessage("Must be an array"),
    body('tags.*').exists().isMongoId().withMessage("Must be a valid ID"),
    body('contents').exists().isString().withMessage("Must be a string")
];

router.put('/posts/:id', [
        auth({output: true, continue: false}),
        param('id').isMongoId().withMessage("Must be valid ID"),
        body('title').optional().isString().withMessage("Must be a string"),
        body('author').optional().isMongoId().withMessage("Must be a valid user id"),
        body('overview').optional().isString().withMessage("Must be a string"),
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

            let body = {
                title: req.body.title,
                author: req.body.author,
                tags: req.body.tags,
                overview: req.body.overview,
                contents: req.body.contents
            };

            e.generateAndUpdateSlug();
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
            overview: req.body.overview,
            contents: req.body.contents
        }).then(e => {
            e.generateAndUpdateSlug();
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
