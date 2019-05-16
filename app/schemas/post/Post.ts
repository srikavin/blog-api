import {Document, Model, model, Schema} from 'mongoose';
import {IPost} from './IPost';
import DataSchema from '../DataSchema';
import {slugify} from "../../util/util";

export interface IPostModel extends IPost, Document {
    generateAndUpdateMeta(newTitle?: string, newContents?: string): { slug: string, overview: string };
}

export const PostSchema = DataSchema({
    title: {
        type: String
    },
    slug: {
        type: String,
        index: true,
        unique: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    tags: [{
        type: Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    draft: {
        type: Schema.Types.Boolean
    },
    overview: {
        type: String
    },
    contents: {
        type: String
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

PostSchema.pre('save', function (next) {
    (this as IPostModel).generateAndUpdateMeta();
    next();
});

PostSchema.index({title: 'text', contents: 'text'});

PostSchema.methods.generateAndUpdateMeta = function (newTitle?: string, newContents?: string) {
    let title = newTitle || this.title;

    //Prepend id to end of slug, allowing for multiple articles with same title
    let slug = this._id + '-' + slugify(title);
    this.slug = slug;

    let contents = newContents || this.contents;
    let overview = contents.substring(0, 600).trim() + '...';
    this.overview = overview;

    return {slug, overview};
};

export const Post: Model<IPostModel> = model<IPostModel>('Post', PostSchema);