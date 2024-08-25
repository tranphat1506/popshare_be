import { LoggerBase } from '@root/config';
import { ServerError, SocketEventError } from '@root/helpers/error-handler';
import { authMiddleware } from '@root/middlewares/auth.middleware';
import { Namespace, Server, Socket } from 'socket.io';
import { SocketEventList } from './socketEvent.constant';

export class BaseSocket extends LoggerBase {
    public io: Server;

    constructor(io: Server, speaker: string) {
        super(speaker);
        this.io = io;
    }

    public catchError(error: unknown, socket: Socket): void {
        if (error instanceof SocketEventError) {
            if (error instanceof ServerError) this.log.error(error);
            socket.emit(SocketEventList.sendSocketRequestError, error.serializeErrors());
        } else this.log.error(error);
    }

    public usingAuthMiddleware(io: Namespace | Server): void {
        // auth middlewares
        io.use(authMiddleware.verifyUserSocketIO);
    }
}
