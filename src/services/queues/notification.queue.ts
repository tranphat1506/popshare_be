import { IAuthJob } from '@root/features/auth/interfaces/auth.interfaces';
import { IFriendJob } from '@root/features/friends/interfaces/friend.interface';
import { IRoomJob } from '@root/features/rooms/interfaces/room.interface';
import { IUserJob } from '@root/features/users/interfaces/user.interface';
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
