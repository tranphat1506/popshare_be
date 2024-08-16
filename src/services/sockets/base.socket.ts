import { LoggerBase } from '@root/config';
import { CustomError, ServerError } from '@root/helpers/error-handler';
import { authMiddleware } from '@root/middlewares/auth.middleware';
import { Server, Socket } from 'socket.io';

export class BaseSocket extends LoggerBase {
    public io: Server;

    constructor(io: Server, speaker: string) {
        super(speaker);
        this.io = io;
    }

    public catchError(error: unknown, socket: Socket): void {
        if (error instanceof CustomError) {
            if (error instanceof ServerError) this.log.error(error);
            socket.emit('response_error_message', error.serializeErrors());
        }
        this.log.error(error);
    }

    public usingAuthMiddleware(): void {
        // auth middlewares
        this.io.engine.use(authMiddleware.verifyUserSocketIO);
    }
}
