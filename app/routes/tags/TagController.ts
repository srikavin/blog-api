import {Request, Response, Router} from "express";
import mongoose from "mongoose";

import {Tag} from "../../schemas/tag/Tag";
import {check, validationResult} from "express-validator/check";
import {auth} from "../../middle/auth";

const router = Router();

interface TagQuery {
    name?: string,
    description?: string,
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
    check('description').exists().isString().withMessage("Must be a string")
];

router.put('/tags/:id', tagValidators,
    (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send({error: "Invalid id"});
        }

        Tag.update({id: req.params.id}, {
            name: req.body.name,
            description: req.body.description
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
            name: req.body.name,
            description: req.body.description
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
