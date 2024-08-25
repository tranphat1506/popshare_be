import { config, LoggerBase } from '@root/config';
import Redis from 'ioredis';

declare global {
    var _redisClient: Redis;
}
export abstract class BaseCache extends LoggerBase {
    client: Redis;
    constructor(cacheName: string) {
        super(cacheName);
        this.client = _redisClient;
        this.log.info(`${this.speaker}::Connect`);
    }
    public async pingToRedis(client: Redis): Promise<void> {
        try {
            this.log.info(`Redis:::${await client.ping()}`);
        } catch (error) {
            this.log.error(error);
        }
    }

    public cacheOnEventListener(client: Redis): void {
        this.cacheConnect(client);
        this.cacheError(client);
        this.cacheClose(client);
    }

    public cacheConnect(client: Redis): void {
        client.on('connect', async () => {
            this.log.info(`Redis:::${this._cacheStatus(client)}`);
        });
    }
    public cacheError(client: Redis): void {
        client.on('error', (error) => {
            this.log.error(error);
            process.exit(1);
        });
    }
    public cacheClose(client: Redis): void {
        client.on('close', () => {
            this.log.info(`Redis:::${this._cacheStatus(client)}`);
        });
    }
    public _cacheStatus(client: Redis): string {
        return client.status;
    }
}

export let redisClient = new Redis(config.REDIS_URL, config.redisOptions());
// global the redis
global._redisClient = redisClient;
