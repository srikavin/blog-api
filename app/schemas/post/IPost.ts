import {IUser} from "../user/IUser";
import {ITag} from "../tag/ITag";

export interface IPost {
    title?: string;
    author?: IUser;
    contents?: string;
    overview?: string;
    draft: boolean;
    tags: [ITag];
}