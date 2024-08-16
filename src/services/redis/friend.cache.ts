import { IFriendDocument, IUpdateFriendRequest } from '@root/features/friends/interfaces/friend.interface';
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
                receiverId: request.reciverId,
                requestTime: request.requestTime,
                responseTime: request.responseTime,
                status: request.status,
            };
            await this.client.hset('friend_request', `${request.senderId}:${request.reciverId}`, JSON.stringify(data));
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error!');
        }
    }

    public async removeFriendRequestFromCache(userId1: string, userId2: string) {
        try {
            const rq1 = await this.client.hdel('friend_request', `${userId1}:${userId2}`);
            const rq2 = await this.client.hdel('friend_request', `${userId2}:${userId1}`);
            return !!rq1 || !!rq2;
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error!');
        }
    }

    public async getFriendRequestFromCache(userId1: string, userId2: string) {
        try {
            const rq1 = await this.client.hget('friend_request', `${userId1}:${userId2}`);
            if (rq1) return JSON.parse(rq1) as IFriendDocument;
            const rq2 = await this.client.hget('friend_request', `${userId2}:${userId1}`);
            if (rq2) return JSON.parse(rq2) as IFriendDocument;
            return null;
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error!');
        }
    }

    public async updateRequestFromCache(senderId: string, reciverId: string, updates: IUpdateFriendRequest) {
        try {
            let cached: any = await this.client.hget('friend_request', `${senderId}:${reciverId}`);
            if (cached == null) {
                throw new BadRequestError('You are not friends with this user so cannot take action.');
            }
            cached = JSON.parse(cached);
            for (const [keyUpdate, valueUpdate] of Object.entries(updates)) {
                cached[keyUpdate] = valueUpdate;
            }
            await this.client.hset('friend_request', `${senderId}:${reciverId}`, JSON.stringify(cached));
            return cached as IFriendDocument;
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error!');
        }
    }
}

export const friendCache = new FriendCache();
