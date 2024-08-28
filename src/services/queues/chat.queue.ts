import { IRoomJob } from '@root/features/rooms/interfaces/room.interface';
import { BaseQueue } from './base.queue';
import { chatWorker } from '../worker/chat.worker';
import { IChatJob } from '@root/features/rooms/interfaces/message.interface';

class ChatQueue extends BaseQueue {
    constructor() {
        super('chatQueue');
        this.processJob('addMessageToDB', 5, chatWorker.addMessageToDB);
    }
    public addMesesageJob(data: IChatJob): void {
        this.addJob('addMessageToDB', data);
    }
}

export const chatQueue = new ChatQueue();
