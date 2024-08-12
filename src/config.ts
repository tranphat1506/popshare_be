import dotenv from 'dotenv';
import path from 'path';
import winston, { Logger } from 'winston';
import 'winston-daily-rotate-file';
dotenv.config({});
type LoggerSpeaker = string;
class Config {
    public NODE_ENV: string;
    public DATABASE_URL: string;
    public SECRET_KEY_ONE: string;
    public SECRET_KEY_TWO: string;
    public CLIENT_URL: string;
    public SERVER_PORT: string | number;

    private readonly DEFAULT_DATABASE_URL = 'mongodb://localhost:27017/popshare_be';

    constructor() {
        this.DATABASE_URL = process.env.DATABASE_URL || this.DEFAULT_DATABASE_URL;
        this.NODE_ENV = process.env.NODE_ENV || '';
        this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || '';
        this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || '';
        this.CLIENT_URL = process.env.CLIENT_URL || '*'; // client url call server
        this.SERVER_PORT = process.env.SERVER_PORT || '3001';
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
            defaultMeta: {
                speaker: speaker,
            },
            format: winston.format.combine(
                winston.format.splat(),
                // Định dạng time cho log
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                // thiết lập định dạng của log
                winston.format.printf((log) => {
                    // nếu log là error hiển thị stack trace còn không hiển thị message của log
                    if (log.level === 'error') return `[${log.timestamp}] [${log.level}]\t ${log.stack}`;
                    return `[${log.timestamp}] [${log.level}]\t ${log.message}`;
                }),
            ),
            transports: [
                // hiển thị log thông qua console
                new winston.transports.Console(),
                // Thiết lập ghi các errors vào file
                new winston.transports.DailyRotateFile({
                    level: 'error',
                    filename: path.join('./logs/error/', '%DATE%_errors.log'),
                    datePattern: 'YYYY-MM-DD',
                    maxFiles: '14d',
                }),
                // Thiết lập ghi các info vào file
                new winston.transports.DailyRotateFile({
                    level: 'info',
                    filename: path.join('./logs/info/', '%DATE%_info.log'),
                    datePattern: 'YYYY-MM-DD',
                    maxFiles: '14d',
                }),
            ],
        });
    }
}
export const config: Config = new Config();
