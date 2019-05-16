import {Document, Model, model} from 'mongoose';
import DataSchema from '../DataSchema';
import {IFile} from './IFile';
import {slugify} from "../../util/util";

export interface IFileModel extends IFile, Document {
}

export const FileSchema = DataSchema({
    title: {
        type: String
    },
    slug: {
        type: String
    },
    filetype: {
        type: String
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

FileSchema.index({title: 'text'});
FileSchema.pre('save', function (next) {
    const file = this as IFileModel;
    file.slug = file._id + '-' + slugify(file.title);

    next();
});

export const File: Model<IFileModel> = model<IFileModel>('File', FileSchema);