import { Server, Socket } from 'socket.io';
import { BaseSocket } from './base.socket';
import { SocketEventList } from './socketEvent.constant';
import { ISocketNotificationRoomSetup } from '@root/features/notifications/interfaces/notifications.interface';
import { SocketEventError } from '@root/helpers/error-handler';
import { CommonSocketServerService } from './commonServices.socket';
import { userCache } from '../redis/user.cache';

export let socketIONotification: Server;
export class NotificationSocket extends BaseSocket {
    constructor(io: Server) {
        super(io, 'notiSocket');
        socketIONotification = io;
    }

    public listen() {
        this.io.on('connection', (socket: Socket) => {
            socket.on(SocketEventList.onSetupNotification, async () => {
                const currentSocketEvent = SocketEventList.onSetupNotification;
                try {
                    const userId = socket.user?.userId;
                    if (!userId) throw new SocketEventError(currentSocketEvent, 'Invalid data.', { userId });
                    CommonSocketServerService.joinSocketNotificationRoom(socket, userId);
                } catch (error) {
                    this.catchError(error, socket);
                }
            });

            // when user online
            socket.on(SocketEventList.handleUserConnect, async () => {
                try {
                    await this.handleConnect(socket);
                } catch (error) {
                    this.catchError(error, socket);
                }
            });
            socket.on('disconnect', () => {});
        });
    }
    private async handleConnect(socket: Socket) {
        const onl = await userCache.addUserToOnlineState(`${socket.user?.userId}`);
        if (onl) await CommonSocketServerService.sendOnlineStateToSocketRooms(socket, onl);
    }
}
