import Queue, { Job } from 'bull';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { config, LoggerBase } from '@root/config';
import { IAuthJob } from '@root/features/auth/interfaces/auth.interfaces';
import { IUserJob } from '@root/features/users/interfaces/user.interface';
import { IFriendJob } from '@root/features/friends/interfaces/friend.interface';
import { IRoomJob } from '@root/features/rooms/interfaces/room.interface';
import { INotiJob } from '@root/features/notifications/interfaces/notifications.interface';
import { IChatJob } from '@root/features/rooms/interfaces/message.interface';
type IBaseJobData = IAuthJob | IUserJob | IFriendJob | IRoomJob | INotiJob | IChatJob;
let bullAdapters: BullAdapter[] = [];
export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue extends LoggerBase {
    public queue: Queue.Queue;

    constructor(queueName: string) {
        super(queueName);
        this.queue = new Queue(queueName, `${config.REDIS_URL}`);
        // Create new queue to global
        bullAdapters.push(new BullAdapter(this.queue));
        // Prevent already have queue so using Set
        bullAdapters = [...new Set(bullAdapters)];
        // Create server board for watching Queues work
        serverAdapter = new ExpressAdapter();
        serverAdapter.setBasePath('/admin/queues');
        createBullBoard({
            queues: bullAdapters,
            serverAdapter,
        });

        this.queue.on('completed', (job: Job) => {
            job.remove();
        });

        this.queue.on('global:completed', (jobId: string) => {
            this.log.info(`[${this.speaker}]::Job ${jobId} completed`);
        });

        this.queue.on('global:stalled', (jobId: string) => {
            this.log.info(`[${this.speaker}]::Job ${jobId} is stalled`);
        });
    }

    protected addJob(name: string, data: IBaseJobData): void {
        this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
    }

    protected processJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
        this.queue.process(name, concurrency, callback);
    }
}
