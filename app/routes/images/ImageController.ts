import {Request, Response, Router} from 'express';

import {Image} from '../../schemas/image/Image';
import {param, validationResult} from 'express-validator/check';
import {auth} from '../../middle/auth';

import bodyParser from 'body-parser';

import {connection} from '../../util/database';
import mongoose from 'mongoose';
import * as Grid from 'gridfs-stream';
import {publicCacheMiddleware} from "../../util/PublicCache";

const sharpImport = import('sharp').then(s => s.default);

const gridfs = require('gridfs-stream');

const router = Router();

let gfs: Grid.Grid;

connection.then(() => {
    gfs = gridfs(mongoose.connection.db, mongoose.mongo);
});

router.use('/images/', bodyParser.json({limit: '25mb'}));

router.get('/images/raw/:id', [
        param('id').isMongoId(),
        publicCacheMiddleware()
    ],
    (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        let id = req.params.id;

        Image.findById(id)
            .select({contents: false})
            .then(e => {
                if (e == null) {
                    res.status(404).send()
                    return
                }

                gfs.exist({
                    _id: id,
                    root: 'images'
                }, (err: Error, found: boolean) => {
                    if (err || !found) {
                        console.log(err);
                        res.status(404);
                        return;
                    }
                    let stream = gfs.createReadStream({
                        _id: id,
                        root: 'images'
                    });

                    res.set('Cache-Control', 'public, max-age=31557600');
                    res.contentType(e.fileType);
                    stream.pipe(res);
                });
            })
            .catch(err => {
                console.error(err);
                res.status(500);
            })
    }
);

router.get('/images/:id', [
        param('id').isMongoId(),
        publicCacheMiddleware()
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
                    res.set('Cache-Control', 'public, max-age=31557600');
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
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        let fileContents = Buffer.from(req.body.contents, 'base64');

        const sharp = await sharpImport;

        let img = sharp(fileContents);
        img.metadata().then(meta => {
            img.resize(20, 20, {withoutEnlargement: true})
                .png()
                .toBuffer()
                .then((value: Buffer) => {
                    let format = meta.format
                    if (format == 'svg') {
                        format = 'svg+xml'
                    }
                    Image.create({
                        title: req.body.title,
                        small: value,
                        // @ts-ignore
                        width: meta.width,
                        // @ts-ignore
                        height: meta.height,
                        fileType: `image/${format}`
                    }).then(e => {
                        let stream = gfs.createWriteStream({
                            _id: e._id,
                            root: 'images',
                            mode: 'w'
                        });

                        stream.write(fileContents, () => {
                            // @ts-ignore
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
