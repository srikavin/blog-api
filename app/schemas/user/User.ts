import {Document, Model, model} from "mongoose";
import {IUser} from "./IUser";
import DataSchema from "../DataSchema";

export interface IUserModel extends IUser, Document {
}

export const UserSchema = DataSchema({
    username: {
        type: String,
        select: true,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        select: false,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        select: false
    }
});

export const User: Model<IUserModel> = model<IUserModel>("User", UserSchema);