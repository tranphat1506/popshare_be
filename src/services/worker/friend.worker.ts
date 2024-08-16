import { LoggerBase } from '@root/config';
import { DoneCallback, Job } from 'bull';
import { userService } from '../db/user.services';
import { friendService } from '../db/friend.services';
import { socketIOUser } from '../sockets/user.socket';
import { IFriendDocument } from '@root/features/friends/interfaces/friend.interface';

class FriendWorker extends LoggerBase {
    constructor() {
        super('userWorker');
    }
    async updateFriendRequest(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { value, key1, key2 } = job.data;
            await friendService.updateFriendRequest(`${key1}`, `${key2}`, value);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            this.log.error(error);
            done(error as Error);
        }
    }
    async createFriendRequest(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { value }: { value: IFriendDocument } = job.data;
            await friendService.createFriendRequest(value);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            this.log.error(error);
            done(error as Error);
        }
    }
    async unFriend(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { key1, key2 } = job.data;
            await friendService.unFriend(key1, key2);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            this.log.error(error);
            done(error as Error);
        }
    }
}

export const friendWorker = new FriendWorker();
