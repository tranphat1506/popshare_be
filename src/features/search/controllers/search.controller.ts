import { NotFoundError } from '@root/helpers/error-handler';
import { userService } from '@root/services/db/user.services';
import { NextFunction, Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class ChatController {
    public async searchByText(req: Request, res: Response, next: NextFunction) {
        try {
            const searchText = req.body.text;
            if (!searchText) throw new NotFoundError('Not found ...');
            const userResult = await userService.searchUserByKeyWord(searchText, 10);
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
