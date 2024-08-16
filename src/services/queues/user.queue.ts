import { BaseQueue } from './base.queue';
import { authWorker } from '../worker/auth.worker';
import { IUserJob } from '@root/features/users/interfaces/user.interface';
import { userWorker } from '../worker/user.worker';

class UserQueue extends BaseQueue {
    constructor() {
        super('userQueue');
        this.processJob('addUserToDB', 5, userWorker.addUserToDB);
    }
    public addUserJob(name: string, data: IUserJob): void {
        this.addJob(name, data);
    }
}

export const userQueue = new UserQueue();
