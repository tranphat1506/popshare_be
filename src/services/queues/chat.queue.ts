import { BaseQueue } from './base.queue';
import { chatWorker } from '../worker/chat.worker';
import { IChatJob } from '@root/features/rooms/interfaces/message.interface';

class ChatQueue extends BaseQueue {
    constructor() {
        super('chatQueue');
        this.processJob('addMessageToDB', 5, chatWorker.addMessageToDB);
        this.processJob('markMessageAsSeen', 5, chatWorker.markMessageAsSeen);
    }
    public addMesesageJob(data: IChatJob): void {
        this.addJob('addMessageToDB', data);
    }
    public markMessageAsSeenJob(data: IChatJob): void {
        this.addJob('markMessageAsSeen', data);
    }
}

export const chatQueue = new ChatQueue();
