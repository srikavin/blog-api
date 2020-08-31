import {Request, Response, Router} from 'express';
import {Model} from 'mongoose';

import {IUserModel, User} from '../../schemas/user/User';
import {RestController} from '../RestController';
import {param, query} from 'express-validator/check';
import {CheckValidation} from '../../util/CheckValidation';
import {IUser} from '../../schemas/user/IUser';
import {PublicCache} from "../../util/PublicCache";

export class UserController extends RestController<IUser, IUserModel, null> {
    constructor() {
        super();
    }

    protected bindMethods(): void {
        this.getByID = this.getByID.bind(this);
        this.getByUsername = this.getByUsername.bind(this);
    }

    protected getModel(): Model<IUserModel> {
        return User;
    }

    protected register(router: Router) {
        router.get('/', [query('username').isString()], this.getByUsername);
        router.get('/:id', [param('id').isMongoId()], this.getByID);
    }

    @CheckValidation
    private getByUsername(req: Request, res: Response) {
        // @ts-ignore
        User.findOne({username: req.query.username})
            .then(this.sendEntity(res))
            .catch(this.error(res));
    }

    @CheckValidation
    @PublicCache()
    private getByID(req: Request, res: Response) {
        this.getEntity(req.params.id)
            .then(this.sendEntity(res))
            .catch(this.error(res));
    }
}
