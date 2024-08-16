import { BadRequestError, NotAuthorizedError } from '@root/helpers/error-handler';
import { friendService } from '@root/services/db/friend.services';
import { NextFunction, Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IFriendsResponseData, RequestStatusTypes } from '../interfaces/friend.interface';

export class GetFriendController {
    public async all(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.currentUser ?? {};
            if (!userId) {
                throw new NotAuthorizedError('Invalid credentials.');
            }
            const friendList = await friendService.getAllFriendRequestByUserId(userId as string);

            res.status(HTTP_STATUS.OK).json({
                message: 'Get friendlist successfully',
                friendList,
            });
        } catch (error) {
            next(error);
        }
    }
    public async byStatusFilter(req: Request, res: Response, next: NextFunction) {
        const { status } = req.params;
        const { userId } = req.currentUser ?? {};
        try {
            if (!userId) {
                throw new NotAuthorizedError('Invalid credentials.');
            }
            let friendList: IFriendsResponseData;
            switch (status as RequestStatusTypes) {
                case 'accepted':
                    friendList = await friendService.getAllAcceptedFriendsByUserId(userId as string);
                    break;
                case 'pending':
                    friendList = await friendService.getAllPendingFriendsByUserId(userId as string);
                    break;
                default:
                    throw new BadRequestError('Invalid status');
            }

            return res.status(HTTP_STATUS.OK).json({
                message: 'Get friendlist successfully',
                friendList,
            });
        } catch (error) {
            next(error);
        }
    }
}
