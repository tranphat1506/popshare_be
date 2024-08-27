import { ObjectId } from 'mongodb';
import { BaseCache } from './base.cache';
import { ServerError } from '@root/helpers/error-handler';

class AuthCache extends BaseCache {
    constructor() {
        super('AuthCache');
    }

    public async saveRefreshToken(refreshToken: string, userId: ObjectId | string): Promise<void> {
        try {
            this.client.hset(`refresh_tokens:${userId}`, `${refreshToken}`, `${userId}`);
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }
    public async checkIsActiveRefreshToken(refreshToken: string, userId: ObjectId | string): Promise<string | null> {
        try {
            return await this.client.hget(`refresh_tokens:${userId}`, `${refreshToken}`);
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }
    public async revokedRefreshToken(refreshToken: string, userId: ObjectId | string): Promise<boolean> {
        try {
            return !!(await this.client.hdel(`refresh_tokens:${userId}`, `${refreshToken}`));
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }
    public async revokedAllRefreshToken(userId: ObjectId | string): Promise<void> {
        try {
            const allRTs = await this.client.hkeys(`refresh_tokens:${userId}`);
            for (const [rtoken] of Object.entries(allRTs)) {
                await this.client.hdel(`refresh_tokens:${userId}`, `${rtoken}`);
            }
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }
}
export const authCache = new AuthCache();
