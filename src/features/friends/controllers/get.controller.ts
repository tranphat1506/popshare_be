import { BadRequestError, NotAuthorizedError } from '@root/helpers/error-handler';
import { friendService } from '@root/services/db/friend.services';
import { NextFunction, Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IFriendDocument, IFriendsResponseData, RequestStatusTypes } from '../interfaces/friend.interface';
import { friendCache } from '@root/services/redis/friend.cache';

export class GetFriendController {
    public async all(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.currentUser!;
            if (!userId) {
                throw new NotAuthorizedError('Invalid credentials.');
            }
            const friendCachedList = (await friendCache.getAllFriendsByUserId(`${userId}`, true)) as IFriendDocument[];
            const friendList: IFriendsResponseData = !friendCachedList
                ? await friendService.getAllFriendRequestByUserId(`${userId}`)
                : {
                      count: friendCachedList.length,
                      friends: friendCachedList,
                  };
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
            let friendCachedList = (await friendCache.getAllFriendsByUserId(`${userId}`, true)) as IFriendDocument[];
            let friendList: IFriendsResponseData;
            switch (status as RequestStatusTypes) {
                case 'accepted':
                    if (friendCachedList) {
                        friendCachedList = friendCachedList.filter((f) => f.status === 'accepted');
                        friendList = {
                            count: friendCachedList.length,
                            friends: friendCachedList,
                        };
                    } else friendList = await friendService.getAllAcceptedFriendsByUserId(userId as string);
                    break;
                case 'pending':
                    if (friendCachedList) {
                        friendCachedList = friendCachedList.filter((f) => f.status === 'pending');
                        friendList = {
                            count: friendCachedList.length,
                            friends: friendCachedList,
                        };
                    } else friendList = await friendService.getAllPendingFriendsByUserId(userId as string);
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
