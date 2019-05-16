import {NextFunction, Request, Response, Router} from 'express';

import {File, IFileModel} from '../../schemas/file/File';
import {body, param, validationResult} from 'express-validator/check';
import {auth} from '../../middle/auth';

import {connection} from '../../util/database';
import mongoose from 'mongoose';
import * as Grid from 'gridfs-stream';
// @ts-ignore
import Busboy from 'busboy'
import bodyParser = require("body-parser");

const gridfs = require('gridfs-stream');

const router = Router();

// @ts-ignore
let gfs: Grid.grid;
connection.then(() => {
    gfs = gridfs(mongoose.connection.db, mongoose.mongo);
});

router.use('/files/', (req: Request, res: Response, next: NextFunction) => {
    if (req.path != '/files/upload') {
        bodyParser.json({limit: '25mb'})(req, res, next);
    } else {
        next();
    }
});

router.get('/files/:id/raw', [
        param('id').isMongoId()
    ],
    (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        let id = req.params.id;

        File.findById(id)
            .select({
                contents: false
            }).then((e: IFileModel | null) => {
                if (e == null) {
                    res.status(404);
                    res.send({error: 'File not found'});
                    return;
                }

                gfs.exist({
                    _id: mongoose.Types.ObjectId(id),
                    root: 'files'
                }, (err: Error, found: boolean) => {
                    if (err || !found) {
                        console.log(err);
                        res.status(404).send({error: 'File not found'});
                        return;
                    }
                    let stream = gfs.createReadStream({
                        _id: mongoose.Types.ObjectId(id),
                        root: 'files'
                    });

                    res.contentType(e.filetype);
                    stream.pipe(res);
                });
            }
        );

        return;
    });
router.get('/files/:id', [
        param('id').isMongoId()
    ],
    (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        let id = req.params.id;

        File.findById(id)
            .exec()
            .then(e => {
                if (e) {
                    res.status(200).send(e);
                    return;
                }
                res.status(404).send({error: 'File not found'});
            })
            .catch(err => {
                console.error(err);
                res.status(500).send({error: 'Unknown error'});
            });
    });

router.post('/files/new/:id', [
    auth(),
    param('id').isMongoId(),
    body('title').isString(),
    body('filetype').isString()
], (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    gfs.exist({
        _id: mongoose.Types.ObjectId(req.params.id),
        root: 'files'
    }, (err: Error, found: boolean) => {
        if (err || !found) {
            console.log(err);
            res.status(404).send({error: 'File not found'});
            return;
        }

        File.create({
            _id: req.params.id,
            title: req.body.title,
            filetype: req.body.filetype
        }).then(e => {
            res.send(e);
        }).catch((err) => {
            console.error(err);
            res.status(500).send({error: 'Unknown error'});
        });
    });
});

router.post('/files/upload', [
    // auth()
], (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }


    try {
        const busboy = new Busboy({headers: req.headers});

        let id = mongoose.Types.ObjectId();
        console.log(0);

        busboy.on('file', function (_fieldname: any, file: any) {
            let stream = gfs.createWriteStream({
                _id: id,
                root: 'files',
                mode: 'w'
            });

            stream.on('error', (e: any) => {
                if (e) {
                    console.error(e);
                }
            });
            console.log(1);

            stream.on('finish', function () {
                // Create file after finishing upload to ensure unfinished uploads are not added
                console.log(2);
                stream.destroy();
                res.send({id: id})
            });

            file.pipe(stream);
        });
        console.log(3);

        return req.pipe(busboy);


    } catch (e) {
        console.error(e);
        res.status(500).send({error: 'Unknown error'});
    }
});

router.delete('/files/:id', [
    auth(),
    param('id').isMongoId()
], (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    File.deleteOne({_id: req.params.id})
        .then(() => {
            res.status(200).send({success: true});
        });
});

export default router;
