import {IPost} from "../post/IPost";
import {Types} from "mongoose";

export interface IComment extends Schema {
    username: string;
    email: string;
    gravatarUrl: string
    contents: string;
    parent?: IComment;
    post: IPost | Types.ObjectId | string;
    visible: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
