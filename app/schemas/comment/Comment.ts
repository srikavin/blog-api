import {Document, Model, model, Schema} from 'mongoose';
import DataSchema from '../DataSchema';
import {IComment} from './IComment';

export interface ICommentModel extends IComment, Document {

}

export const CommentSchema = DataSchema({
    username: {
        type: String,
        required: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        select: false
    },
    contents: {
        type: String,
        required: true
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        required: false
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});


export const Comment: Model<ICommentModel> = model<ICommentModel>('Comment', CommentSchema);