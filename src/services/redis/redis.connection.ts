import { AuthModel } from '@root/features/auth/models/auth.schema';
import { BaseCache } from './base.cache';
import { userCache } from './user.cache';
import { userService } from '../db/user.services';

class RedisConnection extends BaseCache {
    constructor() {
        super('redisConnection');
    }
    public async connect(): Promise<void> {
        try {
            const all = await AuthModel.find();
            await Promise.all(
                all.map(async (authUser) => {
                    const user = await userService.getUserByAuthId(`${authUser._id}`);
                    return userCache.saveUserToCache(`${user._id}`, user);
                }),
            );
            await this.pingToRedis(this.client);
        } catch (error) {
            this.log.error(error);
        }
    }
}
export const redisConnection: RedisConnection = new RedisConnection();
