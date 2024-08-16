import { LoggerBase } from '@root/config';
import { DoneCallback, Job } from 'bull';
import { userService } from '../db/user.services';

class UserWorker extends LoggerBase {
    constructor() {
        super('userWorker');
    }
    async addUserToDB(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { value } = job.data;
            await userService.addUserToDB(value);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            this.log.error(error);
            done(error as Error);
        }
    }
}

export const userWorker = new UserWorker();
