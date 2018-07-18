import {Request, Response, Router} from "express";
import mongoose from "mongoose";

import {Tag} from "../../schemas/tag/Tag";
import {check, param, validationResult} from "express-validator/check";
import {auth} from "../../middle/auth";

const router = Router();

interface TagQuery {
    name?: string,
}

router.get('/tags/', (req, res) => {
    let query: TagQuery = {};
    if (req.query.name) {
        query.name = req.query.name;
    }

    Tag.find(query).exec()
        .then((tag?) => {
            if (tag) {
                return res.status(200).send(tag);
            }
            return res.status(404).send({error: 'No tags found'});
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({error: 'Unknown error occurred'});
        });
});

const tagValidators = [
    auth({output: true, continue: false}),
    check('name').exists().isString().withMessage("Must be a string"),
];

router.delete('/tags/:id', [
    auth({output: true, continue: false}),
    param('id').isMongoId()
], (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    Tag.deleteOne({_id: req.params.id})
        .then(() => {
            res.status(200).send({success: true});
        })
});

router.put('/tags/:id', tagValidators,
    (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send({error: "Invalid id"});
        }

        Tag.update({_id: req.params.id}, {
            name: req.body.name,
        }).then(e => {
            res.status(200).send(e);
        });
    });

router.post('/tags', tagValidators,
    (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        Tag.create({
            name: req.body.name
        }).then(e => {
            e.save(() => {
                res.status(200).send(e)
            });
        });
    });

router.get('/tags/:id', (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send({error: "Invalid id"});
    }
    Tag.findOne({_id: req.params.id}).exec()
        .then((tag?) => {
            if (!tag) {
                return res.status(404).send({error: 'Tag not found'});
            }
            return res.status(200).send(tag);
        })
        .catch((err: any) => {
            console.log(err);
            return res.status(500).send({error: 'Unknown error'});
        });
});

export default router;
