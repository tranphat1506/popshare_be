import { AuthPayload } from '@root/features/auth/interfaces/auth.interfaces';
import { IUserDocument } from '@root/features/users/interfaces/user.interface';

export interface IOnlineState extends IUserDocument {
    userId: string;
    socketId: string;
    isOnline: boolean;
    lastTimeActive: number;
}

export interface ISocketLogin extends AuthPayload {
    userId: string;
}
declare module 'socket.io' {
    interface Socket {
        user?: ISocketLogin;
    }
}
