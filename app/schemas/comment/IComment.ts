import {IPost} from "../post/IPost";

export interface IComment extends Schema {
    username: string;
    email: string;
    gravatarUrl: string
    contents: string;
    parent?: IComment;
    post: IPost;
    visible: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}