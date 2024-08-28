import { IRoomJob } from '@root/features/rooms/interfaces/room.interface';
import { BaseQueue } from './base.queue';
import { roomWorker } from '../worker/room.worker';

class RoomQueue extends BaseQueue {
    constructor() {
        super('roomQueue');
        this.processJob('addRoomToDB', 5, roomWorker.addRoomToDB);
    }
    public addRoomJob(data: IRoomJob): void {
        this.addJob('addRoomToDB', data);
    }
}

export const roomQueue = new RoomQueue();
