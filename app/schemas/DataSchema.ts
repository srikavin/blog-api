import {Document, Schema, SchemaDefinition, SchemaOptions} from "mongoose";

export default function (definition?: SchemaDefinition, options?: SchemaOptions): Schema {
    const schema = new Schema(definition, options);
    schema.set('toJSON', {
        transform(_doc: Document, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    });
    return schema;
}