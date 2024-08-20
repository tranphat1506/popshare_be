import { BaseQueue } from './base.queue';
import { IFriendJob } from '@root/features/friends/interfaces/friend.interface';
import { friendWorker } from '../worker/friend.worker';

class FriendQueue extends BaseQueue {
    constructor() {
        super('friendQueue');
        this.processJob('createFriendRequest', 5, friendWorker.createFriendRequest);
        this.processJob('unFriend', 5, friendWorker.unFriend);
        this.processJob('updateFriendRequest', 5, friendWorker.updateFriendRequest);
    }
    public updateFriendRequest(data: IFriendJob): void {
        this.addJob('updateFriendRequest', data);
    }
    public createFriendRequest(name: string, data: IFriendJob): void {
        this.addJob(name, data);
    }
    public unFriend(data: IFriendJob): void {
        this.addJob('unFriend', data);
    }
}

export const friendQueue = new FriendQueue();
