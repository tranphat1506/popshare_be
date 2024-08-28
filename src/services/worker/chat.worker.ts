import { DoneCallback, Job } from 'bull';
import { LoggerBase } from '@root/config';
import { roomService } from '../db/room.services';
import { IMessageDocument } from '@root/features/rooms/interfaces/message.interface';

class ChatWorker extends LoggerBase {
    constructor() {
        super('chatWorker');
    }
    async addMessageToDB(job: Job, done: DoneCallback): Promise<void> {
        try {
            const messageData: IMessageDocument = job.data.value;
            await roomService.createMessage(messageData.roomId, messageData);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            this.log.error(error);
            done(error as Error);
        }
    }
}

export const chatWorker: ChatWorker = new ChatWorker();
