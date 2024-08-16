import { BadRequestError } from '@root/helpers/error-handler';
import { friendQueue } from '@root/services/queues/friend.queue';
import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { IFriendDocument, IUpdateFriendRequest } from '../interfaces/friend.interface';
import { friendCache } from '@root/services/redis/friend.cache';
import { friendService } from '@root/services/db/friend.services';
import HTTP_STATUS from 'http-status-codes';
export class FriendMethodController {
    public async addFriendMethod(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.body;
        try {
            if (!userId) {
                throw new BadRequestError('Invalid or not found this user.');
            }

            const friendRequestCached = await friendCache.getFriendRequestFromCache(
                `${req.currentUser!.userId}`,
                userId,
            );
            const friendRequest =
                friendRequestCached ??
                (await friendService.getFriendRequestBetweenTwo(`${req.currentUser!.userId}`, userId));
            // If dont have the request
            if (friendRequest === null) {
                const newRequest = {
                    _id: new Types.ObjectId(),
                    senderId: `${req.currentUser!.userId}`,
                    reciverId: userId,
                    status: 'pending',
                    requestTime: Date.now(),
                } as IFriendDocument;
                // add to redis
                await friendCache.addFriendRequestToCache(newRequest);
                // add to db
                friendQueue.createFriendRequest('createFriendRequest', {
                    value: newRequest,
                });
                return res
                    .status(HTTP_STATUS.OK)
                    .json({ message: 'Successfully send add friend request to this user.', friendRequest: newRequest });
            }
            if (friendRequest.status === 'accepted') {
                if (!friendRequestCached) {
                    // add to redis if cached dont have
                    await friendCache.addFriendRequestToCache(friendRequest);
                }
                return res.status(HTTP_STATUS.OK).json({
                    message: 'Successfully send add friend request to this user.',
                    friendRequest: friendRequest,
                });
            }
            // if this user already have request to u, accepted
            if (friendRequest.senderId.toString() === userId) {
                let newRequest: IFriendDocument = friendRequest;
                // update status to redis if exist
                if (friendRequestCached) {
                    newRequest = await friendCache.updateRequestFromCache(userId, `${req.currentUser!.userId}`, {
                        status: 'accepted',
                        responseTime: Date.now(),
                    });
                } else {
                    // else save to cached
                    await friendCache.addFriendRequestToCache(newRequest);
                }

                friendQueue.updateFriendRequest({
                    key1: `${req.currentUser!.userId}`,
                    key2: `${userId}`,
                    value: {
                        status: 'accepted',
                        responseTime: Date.now(),
                    } as IUpdateFriendRequest,
                });
                return res
                    .status(HTTP_STATUS.OK)
                    .json({ message: 'Successfully send add friend request to this user.', friendRequest: newRequest });
            }
            // u already sent the request, please wait
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: 'You already sent the request to this user.',
                friendRequest: friendRequest,
            });
        } catch (error) {
            next(error);
        }
    }

    public async unFriendMethod(req: Request, res: Response, next: NextFunction) {
        const { userId: senderId } = req.currentUser!;
        const { userId: receiverId } = req.body;
        try {
            if (!receiverId) {
                throw new BadRequestError('Invalid or not found this user.');
            }

            const friendRequestCached = await friendCache.getFriendRequestFromCache(`${senderId}`, receiverId);
            const friendRequest =
                friendRequestCached ?? (await friendService.getFriendRequestBetweenTwo(`${senderId}`, receiverId));

            // If dont have the request
            if (friendRequest === null || friendRequest.status === 'pending') {
                return res.status(HTTP_STATUS.OK).json({ message: 'Successfully unfriend this user.' });
            }
            // remove friend to redis if exist
            if (friendRequestCached) {
                await friendCache.removeFriendRequestFromCache(`${senderId}`, receiverId);
            }
            friendQueue.unFriend({
                key1: `${senderId}`,
                key2: receiverId,
            });
            return res.status(HTTP_STATUS.OK).json({ message: 'Successfully unfriend this user.' });
        } catch (error) {
            next(error);
        }
    }
}
