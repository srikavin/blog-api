import {IUser} from '../user/IUser';
import {ITag} from '../tag/ITag';

export interface IPost extends Schema {
    title?: string;
    author?: IUser;
    contents?: string;
    overview?: string;
    tags: [ITag];
    createdAt: Date;
    updatedAt: Date;
}