import { Socket, Server } from 'socket.io';
import { BaseSocket } from './base.socket';

export let socketIOUser: Server;
export class UserSocket extends BaseSocket {
    constructor(io: Server) {
        super(io, 'UserSocket');
        socketIOUser = io;
    }

    public listen(): void {
        socketIOUser.on('connection', (socket: Socket) => {
            socket.on('disconnect', () => {});
        });
    }
}
