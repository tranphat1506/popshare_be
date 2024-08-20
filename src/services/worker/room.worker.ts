import { DoneCallback, Job } from 'bull';
import { LoggerBase } from '@root/config';
import { roomService } from '../db/room.services';

class RoomWorker extends LoggerBase {
    constructor() {
        super('roomWorker');
    }
    async addRoomToDB(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { value } = job.data;
            await roomService.addRoomUserToDB(value);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            this.log.error(error);
            done(error as Error);
        }
    }
}

export const roomWorker: RoomWorker = new RoomWorker();
