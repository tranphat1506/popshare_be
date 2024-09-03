import { IUserDocument } from '@root/features/users/interfaces/user.interface';
import { BaseCache } from './base.cache';
import { Helpers } from '@root/helpers/helpers';
import { ServerError } from '@root/helpers/error-handler';
import { IOnlineState } from '../sockets/socket.interfaces';

class UserCache extends BaseCache {
    constructor() {
        super('UserCache');
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
            isVerify,
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
            isVerify,
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
            if (!user) return null;
            const data = JSON.parse(user);
            Object.keys(data).forEach((field) => {
                data[field] = data[field] === 'undefined' || data[field] === 'null' ? undefined : data[field];
            });
            return data;
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

    public async addUserToOnlineState(userId: string): Promise<IOnlineState> {
        try {
            const onl = {
                userId: userId,
                isOnline: true,
                lastTimeActive: Date.now(),
            } as IOnlineState;
            await this.client.hset(`online`, `${userId}`, JSON.stringify(onl));
            return onl;
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }
    public async updateUserOnlineState(userId: string, status: boolean) {
        try {
            const onl = {
                userId: userId,
                isOnline: status,
                lastTimeActive: Date.now(),
            } as IOnlineState;
            await this.client.hset(`online`, `${userId}`, JSON.stringify(onl));
            return onl;
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }
    public async getUserOnlineState(userId: string) {
        try {
            const stringData = await this.client.hget(`online`, `${userId}`);
            if (!stringData) return null;
            return JSON.parse(stringData) as IOnlineState;
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }
    public async getUserOnlineStateByListOfUserId(userList: (string | null)[]) {
        try {
            const onlineList: { [key: string]: IOnlineState | null } = {};
            await Promise.all(
                userList.map(async (userId) => {
                    if (!userId) return null;
                    const os = await this.getUserOnlineState(userId);
                    onlineList[userId] = os;
                }),
            );
            return onlineList;
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async updateUserByUserId(userId: string, field: keyof IUserDocument, data: any) {
        try {
            const user = await this.getUserFromCache(userId);
            if (!user) return null;
            user[field] = data as never;
            await this.saveUserToCache(userId, user);
        } catch (error) {
            // this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }
}

export const userCache = new UserCache();
