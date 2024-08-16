import mongoose from 'mongoose';
import { config } from '@root/config';
import { Logger } from 'winston';
import { redisConnection } from './services/redis/redis.connection';
import { cloudinaryConnection } from './services/cloudinary/cloudinary.connect';

const log: Logger = config.createLogger('setupDatabase');

export default () => {
    const connect = () => {
        mongoose
            .connect(`${config.DATABASE_URL}`, {
                dbName: 'Popshare',
            })
            .then(() => {
                log.info('Successfully connected to database.');
                redisConnection.connect();
                config.NODE_ENV === 'production' && cloudinaryConnection.connect();
            })
            .catch((error) => {
                log.error('Error connecting to database', error);
                return process.exit(1);
            });
    };
    connect();

    mongoose.connection.on('disconnected', connect);
};
