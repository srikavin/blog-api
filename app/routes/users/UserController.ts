import {Request, RequestHandler, Response, Router} from 'express';
import {Model} from 'mongoose';

import {IUserModel, User} from '../../schemas/user/User';
import {RestController} from '../RestController';
import {param, query} from 'express-validator/check';
import {CheckValidation} from '../../util/CheckValidation';

export class UserController extends RestController<IUserModel> {
    constructor(defHandlers: RequestHandler[]) {
        super(defHandlers);
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
        User.findOne({username: req.query.username})
            .then(this.sendEntity(res))
            .catch(this.error(res));
    }

    @CheckValidation
    private getByID(req: Request, res: Response) {
        this.getEntity(req.params.id)
            .then(this.sendEntity(res))
            .catch(this.error(res));
    }
}
