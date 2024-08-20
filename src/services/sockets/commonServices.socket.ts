import { Socket } from 'socket.io';
import { socketIONotification } from './notification.socket';
import { IEntity, INotificationDocument } from '@root/features/notifications/interfaces/notifications.interface';
import { ServerError } from '@root/helpers/error-handler';
enum SocketEventList {
    sendNotification = 'notiSent',
    broadcastNotification = 'broadcast',
}
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
                throw new ServerError(`Please use broadcast services, not commnon send notification.`);
            default:
                throw new ServerError(
                    `Invalid noti.sender.entityType == ${noti.sender.entityType}, please contact admin.`,
                );
        }
    }
    public static reJoinSocketNotificationRoom(socket: Socket, userId: string) {
        socket.join(userId);
    }
    public static broadcastToAllUsers(noti: INotificationDocument) {
        socketIONotification.emit(SocketEventList.broadcastNotification, noti);
    }
}
