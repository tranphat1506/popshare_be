import { error } from 'console';
import dotenv from 'dotenv';
import { RedisOptions } from 'ioredis';
import path from 'path';
import winston, { Logger } from 'winston';
import 'winston-daily-rotate-file';
dotenv.config({});
export type LoggerSpeaker = string;
export abstract class LoggerBase {
    public speaker: LoggerSpeaker;
    public log: Logger;

    constructor(speaker: LoggerSpeaker) {
        this.speaker = speaker;
        this.log = config.createLogger(this.speaker);
    }
}
class Config {
    public NODE_ENV: string;
    public DATABASE_URL: string;
    public CLIENT_URL: string;
    public SERVER_PORT: string | number;
    public REDIS_URL: string;
    public CLOUDINARY_CLOUD_NAME: string;
    public CLOUDINARY_KEY: string;
    public CLOUDINARY_SECRET: string;
    public JWT_ACCESS_TOKEN_SECRET: string;
    public JWT_REFRESH_TOKEN_SECRET: string;
    public JWT_ACCESS_TOKEN_LIFETIME: string;
    public JWT_REFRESH_TOKEN_LIFETIME: string;
    public APP_VERSION: string;
    private readonly DEFAULT_DATABASE_URL = 'mongodb://localhost:27017/popshare_be';

    constructor() {
        this.DATABASE_URL = process.env.DATABASE_URL || this.DEFAULT_DATABASE_URL;
        this.NODE_ENV = process.env.NODE_ENV || 'development';
        this.CLIENT_URL = process.env.CLIENT_URL || '*'; // client url call server
        this.SERVER_PORT = process.env.SERVER_PORT || '3001';
        this.REDIS_URL = process.env.REDIS_URL || '';
        this.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
        this.CLOUDINARY_KEY = process.env.CLOUDINARY_KEY || '';
        this.CLOUDINARY_SECRET = process.env.CLOUDINARY_SECRET || '';
        this.JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || '123';
        this.JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET || '321';
        this.JWT_ACCESS_TOKEN_LIFETIME = process.env.JWT_ACCESS_TOKEN_LIFETIME || '3h';
        this.JWT_REFRESH_TOKEN_LIFETIME = process.env.JWT_REFRESH_TOKEN_LIFETIME || '7d';
        this.APP_VERSION = process.env.APP_VERSION || 'v1';
    }

    public validateConfig(): void {
        for (const [key, value] of Object.entries(this)) {
            if (value === undefined) {
                throw new Error(`Configuration ${key} is undefined.`);
            }
        }
    }

    public createLogger(speaker: LoggerSpeaker): Logger {
        return winston.createLogger({
            format: winston.format.combine(
                winston.format.splat(),
                // Định dạng time cho log
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                // winston.format.colorize(),
                // thiết lập định dạng của log
                winston.format.printf((log) => {
                    // nếu log là error hiển thị stack trace còn không hiển thị message của log
                    if (log.stack) return `[${log.timestamp}] [${speaker}] [${log.level}] ${log.message}\n${log.stack}`;
                    return `[${log.timestamp}] [${speaker}] [${log.level}] ${log.message}`;
                }),
            ),
            transports: [
                // hiển thị log thông qua console
                new winston.transports.Console(),
                // Thiết lập ghi các errors vào file
                new winston.transports.DailyRotateFile({
                    level: 'error',
                    filename: path.join('./logs/error/', 'error_%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    maxFiles: '14d',
                }),
                // Thiết lập ghi các info vào file
                new winston.transports.DailyRotateFile({
                    level: 'info',
                    filename: path.join('./logs/info/', 'info_%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    maxFiles: '14d',
                }),
                // Thiết lập ghi các info vào file
                new winston.transports.DailyRotateFile({
                    level: 'warning',
                    filename: path.join('./logs/warning/', 'warn_%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    maxFiles: '14d',
                }),
            ],
        });
    }

    public redisOptions(): RedisOptions {
        return {
            connectTimeout: 20000,
            enableAutoPipelining: true,
            lazyConnect: true,
            maxRetriesPerRequest: 30,
        };
    }
}
export const config: Config = new Config();
