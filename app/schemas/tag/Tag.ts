import {Document, Model, model} from 'mongoose';
import {ITag} from './ITag';
import DataSchema from '../DataSchema';

export interface ITagModel extends ITag, Document {
}

export const TagSchema = DataSchema({
    name: {
        type: String,
        unique: true
    },
});

export const Tag: Model<ITagModel> = model<ITagModel>("Tag", TagSchema);