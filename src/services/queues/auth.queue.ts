import { IAuthJob } from '@root/features/auth/interfaces/auth.interfaces';
import { BaseQueue } from './base.queue';
import { authWorker } from '../worker/auth.worker';

class AuthQueue extends BaseQueue {
    constructor() {
        super('authQueue');
        this.processJob('addAuthUserToDB', 5, authWorker.addAuthUserToDB);
        this.processJob('singleUpdateAuthDataByAuthId', 5, authWorker.singleUpdateAuthDataByAuthId);
    }
    public addAuthUserJob(name: string, data: IAuthJob): void {
        this.addJob(name, data);
    }
    public singleUpdateAuthDataByAuthId(data: IAuthJob): void {
        this.addJob('singleUpdateAuthDataByAuthId', data);
    }
}

export const authQueue = new AuthQueue();
