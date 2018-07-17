import {Document, Model, model, Schema} from "mongoose";
import {IPost} from "./IPost";
import DataSchema from "../DataSchema";

export interface IPostModel extends IPost, Document {
    generateAndUpdateMeta(newTitle?: string, newContents?: string): { slug: string, overview: string };
}

export const PostSchema = DataSchema({
    title: {
        type: String,
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
    overview: {
        type: String
    },
    tags: [{
        type: Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    contents: {
        type: String
    },
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

PostSchema.index({title: 'text', contents: 'text'});

PostSchema.methods.generateAndUpdateMeta = function (newTitle?: string, newContents?: string) {
    function slugify(string: string) {
        const a = 'àáäâãåèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;';
        const b = 'aaaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------';
        const p = new RegExp(a.split('').join('|'), 'g');

        return string.toString().toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
            .replace(/&/g, '-and-') // Replace & with 'and'
            .replace(/[^\w\-]+/g, '') // Remove all non-word characters
            .replace(/--+/g, '-') // Replace multiple - with single -
            .replace(/^-+/, '') // Trim - from start of text
            .replace(/-+$/, '') // Trim - from end of text
    }

    let title = newTitle || this.title;

    //Prepend id to end of slug, allowing for multiple articles with same title
    let slug = this._id + '-' + slugify(title);
    this.slug = slug;

    let contents = newContents || this.contents;
    let overview = contents.substring(0, 600).trim() + '...';
    this.overview = overview;

    return {slug, overview};
};

export const Post: Model<IPostModel> = model<IPostModel>("Post", PostSchema);