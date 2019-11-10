import {IPost} from "../post/IPost";

export interface IComment extends Schema {
    username: string;
    email: string;
    contents: string;
    parent?: IComment;
    post: IPost;
    createdAt?: Date;
    updatedAt?: Date;
}