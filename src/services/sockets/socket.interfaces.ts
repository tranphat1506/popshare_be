import { AuthPayload } from '@root/features/auth/interfaces/auth.interfaces';

export interface IOnlineState {
    userId: string;
    isOnline: boolean;
    lastTimeActive: number;
}

export interface ISocketLogin {
    userId: string;
}
declare module 'socket.io' {
    interface Socket {
        user?: ISocketLogin;
    }
}
export interface ISocketSetup {
    rooms: string[];
}
