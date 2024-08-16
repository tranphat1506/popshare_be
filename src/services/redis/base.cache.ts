import { config, LoggerBase } from '@root/config';
import Redis from 'ioredis';
import { Logger } from 'winston';

declare global {
    var _redisClient: Redis;
}
const log: Logger = config.createLogger('Redis');

function cacheOnEventListener(client: Redis): void {
    cacheConnect(client);
    cacheError(client);
    cacheClose(client);
}

function cacheConnect(client: Redis): void {
    client.on('connect', async () => {
        log.info(`Redis:::${_cacheStatus(client)}`);
    });
}
function cacheError(client: Redis): void {
    client.on('error', (error) => {
        log.error(error);
        process.exit(1);
    });
}
function cacheClose(client: Redis): void {
    client.on('close', () => {
        log.info(`Redis:::${_cacheStatus(client)}`);
    });
}
function _cacheStatus(client: Redis): string {
    return client.status;
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
            log.info(`Redis:::${await client.ping()}`);
        } catch (error) {
            log.error(error);
        }
    }
}

export let redisClient = new Redis(config.REDIS_URL, config.redisOptions());
cacheOnEventListener(redisClient);
// global the redis
global._redisClient = redisClient;
