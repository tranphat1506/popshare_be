import { Server, Socket } from 'socket.io';
import { BaseSocket } from './base.socket';

export let socketIORoom: Server;
class RoomSocket extends BaseSocket {
    constructor(io: Server) {
        super(io, 'RoomSocket');
        socketIORoom = io;
    }
    public listen(): void {
        this.io.on('connection', (socket: Socket) => {
            socket.on('disconnect', () => {});
        });
    }
}
