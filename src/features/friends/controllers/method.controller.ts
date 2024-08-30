import { BadRequestError } from '@root/helpers/error-handler';
import { friendQueue } from '@root/services/queues/friend.queue';
import { NextFunction, Request, Response } from 'express';
import { isValidObjectId, Types } from 'mongoose';
import { IFriendDocument, IUpdateFriendRequest } from '../interfaces/friend.interface';
import { friendCache } from '@root/services/redis/friend.cache';
import { friendService } from '@root/services/db/friend.services';
import HTTP_STATUS from 'http-status-codes';
import { IMemberDetail, IRoomDocument } from '@root/features/rooms/interfaces/room.interface';
import { roomCache } from '@root/services/redis/room.cache';
import { roomQueue } from '@root/services/queues/room.queue';
import { INotificationDocument } from '@root/features/notifications/interfaces/notifications.interface';
import { notiQueue } from '@root/services/queues/notification.queue';
import { CommonSocketServerService } from '@root/services/sockets/commonServices.socket';
export class FriendMethodController {
    public async addFriendMethod(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.body;
        try {
            if (!userId || userId === req.currentUser?.userId || !isValidObjectId(userId)) {
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
                    senderId: new Types.ObjectId(`${req.currentUser!.userId}`),
                    receiverId: new Types.ObjectId(`${userId}`),
                    status: 'pending',
                    requestTime: Date.now(),
                } as IFriendDocument;
                const newNoti = {
                    _id: new Types.ObjectId(),
                    sender: {
                        entityType: 'user',
                        userId: new Types.ObjectId(`${req.currentUser!.userId}`),
                    },
                    receiver: {
                        entityType: 'user',
                        userId: new Types.ObjectId(`${userId}`),
                    },
                    notificationType: 'friend_request',
                    notificationMessages: ['%SENDER% has sent %RECEIVER% a friend request'],
                    notificationReaders: [
                        {
                            entityType: 'user',
                            userId: new Types.ObjectId(`${req.currentUser!.userId}`),
                        },
                    ],
                    createdAt: Date.now(),
                } as INotificationDocument;
                // add to redis
                await friendCache.addFriendRequestToCache(newRequest);

                // add to db
                friendQueue.createFriendRequest('createFriendRequest', {
                    value: newRequest,
                });
                notiQueue.addNotiToDB({ value: newNoti });

                // socket
                CommonSocketServerService.sendNotificationToEntity(newNoti);

                return res
                    .status(HTTP_STATUS.OK)
                    .json({ message: 'Successfully send add friend request to this user.', friendRequest: newRequest });
            }
            if (friendRequest.status === 'accepted') {
                if (!friendRequestCached) {
                    // add to redis if cached dont have
                    await friendCache.addFriendRequestToCache(friendRequest);
                }
                // socket

                // response
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
                const newRoom = {
                    _id: new Types.ObjectId(),
                    roomType: 'p2p',
                    createdAt: Date.now(),
                    createdBy: new Types.ObjectId(`${req.currentUser!.userId}`),
                    roomMembers: {
                        member: 2,
                        list: [
                            {
                                memberId: new Types.ObjectId(`${req.currentUser!.userId}`),
                                position: 'owner',
                                permissionScore: 9999,
                            },
                            {
                                memberId: new Types.ObjectId(`${userId}`),
                                position: 'owner',
                                permissionScore: 9999,
                            },
                        ],
                    },
                    roomBannedList: {
                        member: 0,
                        list: [] as IMemberDetail[],
                    },
                } as IRoomDocument;
                await roomCache.addRoomToCache(newRoom);
                roomQueue.addRoomJob({ value: newRoom });
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
