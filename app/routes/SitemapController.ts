import {Request, Response, Router} from 'express';
import {Model} from 'mongoose';
import xml from 'xml';

import {IPost} from '../schemas/post/IPost';
import {IPostModel, Post} from '../schemas/post/Post';
import {RestController} from './RestController';
import {CheckValidation} from '../util/CheckValidation';

interface SitemapQuery {
}

export class SitemapController extends RestController<IPost, IPostModel, SitemapQuery> {
    constructor() {
        super();
    }

    protected bindMethods() {
        this.getAll = this.getAll.bind(this);
    }

    protected register(router: Router): void {
        router.get('/sitemap.xml', this.getAll);
    }


    protected getModel(): Model<IPostModel> {
        return Post;
    }

    @CheckValidation
    private getAll(req: Request, res: Response) {
        res.type('application/xml');
        const hostname = req.headers['x-forwarded-host'] || req.headers['host'];

        let links: any = [];

        this.getEntities({limit: 5000, skip: 0, fields: {}}).then(e => {
            e.forEach((item: IPostModel) => {
                if (item.draft) {
                    return;
                }
                let contents = [];
                contents.push({loc: `https://${hostname}/blog/posts/${item.slug}`});
                if (item.updatedAt) {
                    contents.push({lastmod: item.updatedAt.toISOString()});
                }
                links.push({url: contents});
            });

            let obj = [{
                urlset: [
                    {
                        _attr: {
                            xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
                        }
                    },
                    ...links
                ]
            }];

            res.send(xml(obj, {declaration: true})).status(200);
        });

    }
}
