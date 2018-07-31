import {IUser} from '../user/IUser';
import {ITag} from '../tag/ITag';

export interface IPost extends Schema {
    title: string;
    author: IUser;
    contents: string;
    tags: [ITag];
    draft: boolean;
    overview?: string;
    createdAt?: Date;
    updatedAt?: Date;
    slug?: string;
}