import { Socket, Server } from 'socket.io';
import { BaseSocket } from './base.socket';
import { SocketEventList } from './socketEvent.constant';
import { userCache } from '../redis/user.cache';
import { CommonSocketServerService } from './commonServices.socket';

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
