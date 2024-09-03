import {
    IFriendDocument,
    IUpdateFriendRequest,
    RequestStatusTypes,
} from '@root/features/friends/interfaces/friend.interface';
import { BaseCache } from './base.cache';
import { BadRequestError, ServerError } from '@root/helpers/error-handler';

class FriendCache extends BaseCache {
    constructor() {
        super('FriendCache');
    }

    public async addFriendRequestToCache(request: IFriendDocument) {
        try {
            const data = {
                _id: request._id,
                senderId: request.senderId,
                receiverId: request.receiverId,
                requestTime: request.requestTime,
                responseTime: request.responseTime,
                status: request.status,
            };
            await this.client.hset(`friend_request`, `${request._id}`, JSON.stringify(data));
            await this.client.hset(`friend_list:${request.senderId}`, `${request.receiverId}`, `${request._id}`);
            await this.client.hset(`friend_list:${request.receiverId}`, `${request.senderId}`, `${request._id}`);
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error!');
        }
    }

    public async removeFriendRequestFromCache(userId1: string, userId2: string) {
        try {
            const rq = await this.getFriendRequestFromCache(userId1, userId2);
            if (!rq) return null;
            await this.client.hdel(`friend_list:${userId1}`, `${userId2}`);
            await this.client.hdel(`friend_list:${userId2}`, `${userId1}`);
            return await this.client.hdel(`friend_request`, `${rq._id}`);
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error!');
        }
    }

    public async getFriendRequestFromCache(userId1: string, userId2: string) {
        try {
            const rqId = await this.client.hget(`friend_list:${userId1}`, `${userId2}`);
            const dataString = await this.client.hget('friend_request', `${rqId}`);
            if (dataString == null) return null;
            let data = JSON.parse(dataString) as IFriendDocument;
            // const senderInfo = await userCache.getUserFromCache(`${data.senderId}`);
            // const receiverInfo = await userCache.getUserFromCache(`${data.receiverId}`);
            // if (!senderInfo || !receiverInfo) return null;
            // data = {
            //     receiverInfo: {
            //         username: receiverInfo.username!,
            //         displayName: receiverInfo.displayName,
            //         avatarEmoji: receiverInfo.avatarEmoji,
            //         profilePicture: receiverInfo.profilePicture,
            //         avatarColor: receiverInfo.avatarColor,
            //     },
            //     senderInfo: {
            //         username: senderInfo.username!,
            //         displayName: senderInfo.displayName,
            //         avatarEmoji: senderInfo.avatarEmoji,
            //         profilePicture: senderInfo.profilePicture,
            //         avatarColor: senderInfo.avatarColor,
            //     },
            //     ...data,
            // } as IFriendDocument;
            return data;
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error!');
        }
    }

    public async getFriendRequestByFriendRequestId(requestId: string) {
        try {
            const rq = await this.client.hget(`friend_request`, `${requestId}`);
            if (rq) return JSON.parse(rq) as IFriendDocument;
            return null;
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error!');
        }
    }

    public async checkingPermitBetweenTwoUser(userId1: string, userId2: string): Promise<RequestStatusTypes | null> {
        try {
            const friendship = await this.getFriendRequestFromCache(userId1, userId2);
            if (!friendship) return userId1 === userId2 ? 'accepted' : null;
            return friendship.status;
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error!');
        }
    }

    public async getAllFriendsByUserId(userId: string, returnDetail?: boolean) {
        try {
            const friendsList: string[] = await this.client.hkeys(`friend_list:${userId}`);
            if (!returnDetail) return friendsList.length === 0 ? null : friendsList;
            const fetchDetail = await Promise.all(
                friendsList.map((userId2) => {
                    return this.getFriendRequestFromCache(userId, userId2);
                }),
            );
            const result = fetchDetail.filter((req) => req !== null);
            return result.length === 0 ? null : result;
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error!');
        }
    }

    public async removeFriendRequestByFriendRequestId(requestId: string) {
        try {
            const rq = await this.client.hget(`friend_request`, `${requestId}`);
            if (!rq) return null;
            const { senderId, receiverId } = JSON.parse(rq) as IFriendDocument;
            await this.client.hdel(`friend_list:${senderId}`, `${receiverId}`);
            await this.client.hdel(`friend_list:${receiverId}`, `${senderId}`);
            return true;
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error!');
        }
    }

    public async updateRequestFromCache(senderId: string, receiverId: string, updates: IUpdateFriendRequest) {
        try {
            const rqId = await this.client.hget(`friend_list:${receiverId}`, `${senderId}`);
            let cached: any = await this.client.hget(`friend_request`, `${rqId}`);
            if (cached == null) {
                throw new BadRequestError('You are not friends with this user so cannot take action.');
            }
            cached = JSON.parse(cached) as IFriendDocument;
            for (const [keyUpdate, valueUpdate] of Object.entries(updates)) {
                cached[keyUpdate] = valueUpdate;
            }
            await this.client.hset('friend_request', `${cached._id}`, JSON.stringify(cached));
            return cached as IFriendDocument;
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error!');
        }
    }
}

export const friendCache = new FriendCache();
