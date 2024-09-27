import { NotFoundError } from '@root/helpers/error-handler';
import { userService } from '@root/services/db/user.services';
import { NextFunction, Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class SearchController {
    public async searchByKeyword(req: Request, res: Response, next: NextFunction) {
        try {
            const searchKeyword = req.body.keyword;
            if (!searchKeyword) throw new NotFoundError('Not found ...');
            const userResult = await userService.searchUserByKeyword(searchKeyword, 10);
            return res.status(HTTP_STATUS.OK).json({
                mesesage: 'Search result',
                result: {
                    user: userResult,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}
