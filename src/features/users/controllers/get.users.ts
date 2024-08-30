import { IFriendDocument, IFriendsResponseData } from '@root/features/friends/interfaces/friend.interface';
import { BadRequestError, NotFoundError } from '@root/helpers/error-handler';
import { friendService } from '@root/services/db/friend.services';
import { userService } from '@root/services/db/user.services';
import { friendCache } from '@root/services/redis/friend.cache';
import { userCache } from '@root/services/redis/user.cache';
import { NextFunction, Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IUserPublicDetail } from '../interfaces/user.interface';
import mongoose, { isValidObjectId } from 'mongoose';

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
            return res.status(HTTP_STATUS.OK).json({
                message: 'Successfully get detail user.',
                user,
                friends: {
                    count: friendList.count,
                    friendList: friendList.friends.map((f) =>
                        `${f.receiverId}` === userId ? `${f.senderId}` : `${f.receiverId}`,
                    ),
                },
            });
        } catch (error) {
            next(error);
        }
    }

    public async getByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.currentUser!;
            const { userId: tagetId } = req.params;
            if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
                throw new NotFoundError('Cannot found this user.');
            }
            const friendship = await friendService.getFriendRequestBetweenTwo(`${userId}`, tagetId);
            const userCached = await userCache.getUserFromCache(`${tagetId}`);
            let user = userCached ?? (await userService.getUserByUserId(`${tagetId}`));
            if (!user) {
                throw new NotFoundError('Cannot found this user.');
            }
            if (friendship?.status === 'accepted' || tagetId === `${userId}`) {
                return res.status(HTTP_STATUS.OK).json({
                    message: 'Successfully get detail user.',
                    user: {
                        _id: user._id,
                        username: user.username,
                        avatarColor: user.avatarColor,
                        avatarEmoji: user.avatarEmoji,
                        displayName: user.displayName,
                        profilePicture: user.profilePicture,
                        createdAt: user.createdAt,
                    } as IUserPublicDetail,
                    onlineState: await userCache.getUserOnlineState(tagetId),
                });
            }
            if (friendship?.status === 'pending') {
                return res.status(HTTP_STATUS.OK).json({
                    message: 'Successfully get detail user.',
                    user: {
                        _id: user._id,
                        username: user.username,
                        avatarColor: user.avatarColor,
                        avatarEmoji: user.avatarEmoji,
                        displayName: user.displayName,
                        profilePicture: user.profilePicture,
                        createdAt: user.createdAt,
                    } as IUserPublicDetail,
                });
            }
        } catch (error) {
            next(error);
        }
    }

    public async getOnlineStateByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.currentUser!;
            const { userId: targetId } = req.params;
            if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
                throw new BadRequestError('Invalid user id.');
            }
            const onlineState = await this._gettingOnlineState(`${userId}`, targetId);
            return res.status(HTTP_STATUS.OK).json({
                message: 'Successfully get detail user online state.',
                onlineState: onlineState,
            });
        } catch (error) {
            next(error);
        }
    }

    public async getOnlineStateByUserList(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.currentUser!;
            const userList = req.body.userList as string[];
            if (!userList || !userList.length) {
                throw new BadRequestError('Invalid user list.');
            }
            const result = await Promise.all(userList.map((id) => this._gettingOnlineState(`${userId}`, id)));
            return res.status(HTTP_STATUS.OK).json({
                message: 'Successfully get detail user online state.',
                onlineList: result,
            });
        } catch (error) {
            next(error);
        }
    }

    private async _gettingOnlineState(userId: string, targetId: string) {
        const friendship = await friendService.getFriendRequestBetweenTwo(`${userId}`, targetId);
        if (friendship?.status === 'accepted' || targetId === `${userId}`) {
            return await userCache.getUserOnlineState(targetId);
        } else {
            throw new BadRequestError('You cannot access this user online state.');
        }
    }
}
