import { BaseQueue } from './base.queue';
import { INotiJob } from '@root/features/notifications/interfaces/notifications.interface';
import { notiWorker } from '../worker/notification.worker';

class NotificationQueue extends BaseQueue {
    constructor() {
        super('NotiQueue');
        this.processJob('addNotiToDB', 5, notiWorker.addNotiToDB);
    }

    public async addNotiToDB(data: INotiJob) {
        this.addJob('addNotiToDB', data);
    }
}

export const notiQueue = new NotificationQueue();
