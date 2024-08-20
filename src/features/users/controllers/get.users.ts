import { IFriendDocument, IFriendsResponseData } from '@root/features/friends/interfaces/friend.interface';
import { NotFoundError } from '@root/helpers/error-handler';
import { friendService } from '@root/services/db/friend.services';
import { userService } from '@root/services/db/user.services';
import { friendCache } from '@root/services/redis/friend.cache';
import { userCache } from '@root/services/redis/user.cache';
import { NextFunction, Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class GetUserController {
    public async all(req: Request, res: Response): Promise<void> {
        res.status(HTTP_STATUS.OK).json({
            message: 'Get Method',
        });
    }

    public async me(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.currentUser!;
            const userCached = await userCache.getUserFromCache(`${userId}`);
            const user = userCached ?? (await userService.getUserByUserId(`${userId}`));

            if (!user) {
                throw new NotFoundError('Cannot found this user.');
            }
            const friendCachedList = (await friendCache.getAllFriendsByUserId(`${userId}`, true)) as IFriendDocument[];
            const friendList: IFriendsResponseData = !friendCachedList
                ? await friendService.getAllFriendRequestByUserId(`${userId}`)
                : {
                      count: friendCachedList.length,
                      friends: friendCachedList,
                  };
            return res
                .status(HTTP_STATUS.OK)
                .json({ message: 'Successfully get detail user.', user: user, friends: friendList });
        } catch (error) {
            next(error);
        }
    }
}
