import {Document, Model, model, Schema} from 'mongoose';
import DataSchema from '../DataSchema';
import {IImage} from './IImage';

export interface IImageModel extends IImage, Document {
}

export const ImageSchema = DataSchema({
    title: {
        type: String
    },
    contents: {
        type: Schema.Types.Buffer,
        contentType: String
    },
    small: {
        type: Schema.Types.Buffer,
        contentType: String
    },
    width: {
        type: Schema.Types.Number
    },
    height: {
        type: Schema.Types.Number
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
}, function (_doc: Document, ret) {
    let img = _doc as IImageModel;
    if (ret.contents) {
        ret.contents = img.contents.toString('base64');
    }
    if (ret.small) {
        ret.small = img.small.toString('base64');
    }
    ret.url = `/images/raw/${_doc._id}`;
});

ImageSchema.index({title: 'text'});

export const Image: Model<IImageModel> = model<IImageModel>('Image', ImageSchema);