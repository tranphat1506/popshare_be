import { LoggerBase } from '@root/config';
import { DoneCallback, Job } from 'bull';
import { notiService } from '../db/notification.services';

class NotificationWorker extends LoggerBase {
    constructor() {
        super('notiWorker');
    }
    async addNotiToDB(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { value } = job.data;
            await notiService.addNotiToDB(value);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            this.log.error(error);
            done(error as Error);
        }
    }
}

export const notiWorker = new NotificationWorker();
