import {Document, Schema, SchemaDefinition, SchemaOptions} from 'mongoose';

export default function (definition?: SchemaDefinition, options?: SchemaOptions, toJSON?: (_doc: Document, ret: any) => any): Schema {
    const schema = new Schema(definition, options);
    schema.set('toJSON', {
        transform(_doc: Document, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            if (toJSON) {
                toJSON(_doc, ret);
            }
        }
    });
    return schema;
}