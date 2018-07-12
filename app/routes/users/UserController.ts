import express from "express";
import mongoose from "mongoose";

import {User} from "../../schemas/user/User";

const router = express.Router();

router.get('/users/', (req, res) => {
    const username = req.query.username;
    if (!username) {
        return res.status(400).send({error: 'Must provide a username'});
    }

    User.findOne({username: username}).exec()
        .then((user?) => {
            if (user) {
                return res.status(200).send(user);
            }
            return res.status(404).send({error: 'User not found'});
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({error: 'Unknown error occurred'});
        });
});

router.get('/users/:id', (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send({error: "Invalid id"});
    }
    User.findOne({_id: req.params.id}).exec()
        .then((user?) => {
            if (!user) {
                return res.status(404).send({error: 'User not found'});
            }
            return res.status(200).send(user);
        })
        .catch((err: any) => {
            console.log(err);
            return res.status(500).send({error: 'Unknown error'});
        });
});

export default router;
