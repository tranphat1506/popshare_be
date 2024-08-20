import { INotificationDocument } from '@root/features/notifications/interfaces/notifications.interface';
import { BaseCache } from './base.cache';
import { ServerError } from '@root/helpers/error-handler';

class NotificationCache extends BaseCache {
    constructor() {
        super('notiCache');
    }

    public async addNotiToCache(noti: INotificationDocument) {
        try {
            this.client.hset(`notifications`, `${noti._id}`, JSON.stringify(noti));
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }
}
