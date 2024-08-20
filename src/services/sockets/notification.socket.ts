import { Server, Socket } from 'socket.io';
import { BaseSocket } from './base.socket';

export let socketIONotification: Server;
export class NotificationSocket extends BaseSocket {
    constructor(io: Server) {
        super(io, 'notiSocket');
        socketIONotification = io;
    }

    public listen() {
        this.io.on('connection', (socket: Socket) => {
            console.log('Welcome');
            socket.on('disconnect', () => {});
        });
    }
}
