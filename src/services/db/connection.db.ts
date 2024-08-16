import mongoose from 'mongoose';
import { config, LoggerBase } from '@root/config';

class MongoDbConnection extends LoggerBase {
    constructor() {
        super('dbConnection');
    }
    connect(): void {
        this.setupDatabase();
        mongoose.connection.on('disconnected', this.connect);
    }
    async setupDatabase(): Promise<void> {
        try {
            await mongoose.connect(`${config.DATABASE_URL}`);
            this.log.info('Successfully connected to MongoDB');
        } catch (error) {
            this.log.error(error);
            return process.exit(1);
        }
    }
}

export const dbConnection = new MongoDbConnection();
