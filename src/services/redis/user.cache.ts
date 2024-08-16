import { IUserDocument } from '@root/features/users/interfaces/user.interface';
import { BaseCache } from './base.cache';
import { Helpers } from '@root/helpers/helpers';
import { ServerError } from '@root/helpers/error-handler';
import { IOnlineState } from '../sockets/socket.interfaces';

class UserCache extends BaseCache {
    constructor() {
        super('User');
    }

    public async saveUserToCache(userId: string, createdUser: IUserDocument): Promise<void> {
        const {
            _id,
            username,
            email,
            avatarColor,
            avatarEmoji,
            profilePicture,
            notifications,
            privacies,
            displayName,
        } = createdUser;
        const dataToSave = {
            _id: `${_id}`,
            username: `${username}`,
            email: `${email}`,
            avatarColor: `${avatarColor}`,
            displayName: `${displayName}`,
            avatarEmoji: `${avatarEmoji}`,
            profilePicture: `${profilePicture}`,
            notifications: notifications,
            privacies: privacies,
        };
        try {
            await this.client.zadd('userid_sort_list', Helpers.generateRandomIntegers(10), userId);
            await this.client.hset(`users`, `${_id}`, JSON.stringify(dataToSave));
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
        try {
            const user = await this.client.hget(`users`, `${userId}`);
            return user ? (JSON.parse(user) as IUserDocument) : null;
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async addMemberToRoom(userId: string, rooms: string[]): Promise<void> {
        try {
            for (const roomId of rooms) {
                await this.client.hset(`room:${roomId}`, 'members', `${userId}`);
            }
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async addUserToOnlineState(user: IUserDocument, socketId: string): Promise<void> {
        try {
            const onl = {
                ...user.toObject(),
                userId: user._id.toString(),
                socketId,
                isOnline: true,
                lastTimeActive: Date.now(),
            } as IOnlineState;
            await this.client.hset(`online:${onl.userId}`, `${socketId}`, JSON.stringify(onl));
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }
}

export const userCache = new UserCache();
