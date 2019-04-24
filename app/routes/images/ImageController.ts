import {Request, Response, Router} from 'express';

import {Image} from '../../schemas/image/Image';
import {param, validationResult} from 'express-validator/check';
import {auth} from '../../middle/auth';

import sharp from 'sharp';
import bodyParser from 'body-parser';

import {connection} from '../../util/database';
import mongoose from 'mongoose';
import * as Grid from 'gridfs-stream';

const gridfs = require('gridfs-stream');

const router = Router();

// @ts-ignore
let gfs: Grid.grid;
connection.then(() => {
    gfs = gridfs(mongoose.connection.db, mongoose.mongo);
});

router.use('/images/', bodyParser.json({limit: '25mb'}));

router.get('/images/raw/:id', [
        param('id').isMongoId()
    ],
    (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        let id = req.params.id;

        gfs.exist({
            _id: mongoose.Types.ObjectId(id),
            root: 'images'
        }, (err: Error, found: boolean) => {
            if (err || !found) {
                console.log(err);
                res.status(404).send({error: 'File not found'});
                return;
            }
            let stream = gfs.createReadStream({
                _id: mongoose.Types.ObjectId(id),
                root: 'images'
            });

            res.contentType('image/png');
            stream.pipe(res);
        });

        return;
    });
router.get('/images/:id', [
        param('id').isMongoId()
    ],
    (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        let id = req.params.id;

        Image.findById(id)
            .select({
                contents: false
            })
            .exec()
            .then(e => {
                if (e) {
                    res.status(200).send(e);
                    return;
                }
                res.status(404).send({error: 'Not found'});
            })
            .catch(err => {
                console.error(err);
                res.status(500).send({error: 'Unknown error'});
            });
    });

router.post('/images', [
        auth()
    ],
    (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        let fileContents = Buffer.from(req.body.contents, 'base64');

        let img = sharp(fileContents);
        img.metadata().then(meta => {
            img.resize({canvas: 'min', height: 20, width: 20, withoutEnlargement: true})
                .png()
                .toBuffer()
                .then((value: Buffer) => {
                    Image.create({
                        title: req.body.title,
                        small: value,
                        width: meta.width,
                        height: meta.height
                    }).then(e => {
                        let stream = gfs.createWriteStream({
                            _id: mongoose.Types.ObjectId(e._id),
                            root: 'images',
                            mode: 'w'
                        });

                        stream.write(fileContents, () => {
                            stream.destroy();
                        });

                        stream.on('error', console.error);

                        stream.on('close', function () {
                            res.status(200).send(e);
                        });

                    }).catch((err) => {
                        console.error(err);
                        res.status(500).send({error: 'Unknown error'});
                    });
                }).catch((err) => {
                console.error(err);
                res.status(500).send({error: 'Unknown error'});
            });
        });
    });

router.delete('/images/:id', [
    auth({output: true, continue: false}),
    param('id').isMongoId()
], (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    Image.deleteOne({_id: req.params.id})
        .then(() => {
            res.status(200).send({success: true});
        });
});

export default router;
