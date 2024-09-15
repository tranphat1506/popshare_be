import { Socket } from 'socket.io';
import { socketIONotification } from './notification.socket';
import { IEntity, INotificationDocument } from '@root/features/notifications/interfaces/notifications.interface';
import { BadRequestError, SocketEventError } from '@root/helpers/error-handler';
import { SocketEventList } from './socketEvent.constant';
import { roomCache } from '../redis/room.cache';
import { IUpdateMessagePayload } from '@root/features/rooms/interfaces/message.interface';
import { IOnlineState } from './socket.interfaces';
import { friendCache } from '../redis/friend.cache';
export class CommonSocketServerService {
    public static sendNotificationToEntity(noti: INotificationDocument, receiverEntity?: IEntity) {
        const receiver: IEntity = receiverEntity ?? noti.receiver;
        const toReceiver: string = `${receiver.userId}` || `${receiver.roomId}`;
        switch (noti.notificationType) {
            case 'friend_request':
            case 'message':
            case 'others':
            case 'security':
                socketIONotification.to(toReceiver).emit(SocketEventList.sendNotification, noti);
                break;
            case 'broadcast':
                throw new BadRequestError(`Please use broadcast services, not commnon send notification.`);
            default:
                throw new BadRequestError(
                    `Invalid noti.sender.entityType == ${noti.sender.entityType}, please contact admin.`,
                );
        }
    }
    public static joinSocketNotificationRoom(socket: Socket, userId: string) {
        this._joinSocketRoom(socket, userId);
    }
    public static broadcastToAllUsers(noti: INotificationDocument) {
        socketIONotification.emit(SocketEventList.broadcastNotification, noti);
    }
    public static async sendOnlineStateToSocketRooms(socket: Socket, onlineState: IOnlineState) {
        const rooms = Array.from(socket.rooms);
        rooms.shift();
        for (const roomId of rooms) {
            socketIONotification.to(roomId).emit(SocketEventList.sendOnlineState, onlineState);
        }
    }
    public static joinSocketChatRoom(socket: Socket, roomId: string) {
        this._joinSocketRoom(socket, roomId);
    }
    public static async joinSocketChatRooms(socket: Socket, roomList: string[]) {
        for await (const roomId of roomList) {
            const { canAction, message } = await roomCache.checkingPermit2ActionByUserId(
                `${socket.user!.userId}`,
                roomId,
                'socketJoin',
            );
            if (!canAction) {
                throw new SocketEventError(SocketEventList.onSetupChatRoom, message, null);
            }
            // console.log(`${socket.user?.userId} join ${roomId}`);
            this._joinSocketRoom(socket, roomId);
        }
    }
    private static _joinSocketRoom(socket: Socket, roomId: string) {
        socket.join(roomId);
    }
}
