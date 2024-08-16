import { BaseCache } from './base.cache';

class RedisConnection extends BaseCache {
    constructor() {
        super('redisConnection');
    }
    public async connect(): Promise<void> {
        try {
            this.pingToRedis(this.client);
        } catch (error) {
            this.log.error(error);
        }
    }
}
export const redisConnection: RedisConnection = new RedisConnection();
