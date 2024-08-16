import { Socket, Server } from 'socket.io';
import { ISocketLogin } from './socket.interfaces';
import { BaseSocket } from './base.socket';

export let socketIOUser: Server;
export class UserSocket extends BaseSocket {
    constructor(io: Server) {
        super(io, 'UserSocket');
        socketIOUser = io;
    }

    public listen(): void {
        this.io.on('connection', (socket: Socket) => {
            socket.on('online', async (data: ISocketLogin) => {
                const { userId } = data;
                try {
                    const getRooms = null; //;
                    // push me to friends room
                    // get current friend online in my room
                    // notifications i am online
                } catch (error) {
                    this.catchError(error, socket);
                }
            });

            socket.on('disconnect', () => {});
        });
    }
}
