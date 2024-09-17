import { Server, Socket } from 'socket.io';
import { BaseSocket } from './base.socket';
import { SocketEventError } from '@root/helpers/error-handler';
import { SocketEventList } from './socketEvent.constant';
import { IOnTypingPayload, IResponseOnTyping } from '@root/features/rooms/interfaces/message.interface';
import { roomCache } from '../redis/room.cache';
import { socketIORoom } from './room.socket';

export let socketIOChatRoom: Server;
export class ChatRoomSocket extends BaseSocket {
    constructor(io: Server) {
        super(io, 'RoomSocket');
        socketIOChatRoom = io;
    }
    public listen(): void {
        this.io.on('connection', (socket: Socket) => {
            socket.on(SocketEventList.onTyping, async (data: IOnTypingPayload) => {
                const currentSocketEvent = SocketEventList.onTyping;
                try {
                    if (!data.roomId) throw new SocketEventError(currentSocketEvent, 'Invalid Room Id', data);
                    if (!data.typeTyping) throw new SocketEventError(currentSocketEvent, 'Invalid type', data);
                    const { canAction, message } = await roomCache.checkingPermit2ActionByUserId(
                        `${socket.user?.userId}`,
                        data.roomId,
                        'sendMessage',
                    );
                    if (!canAction) throw new SocketEventError(currentSocketEvent, message, data);
                    socketIORoom.to(data.roomId).emit(SocketEventList.responseTyping, {
                        ...data,
                        userId: `${socket.user?.userId}`,
                    } as IResponseOnTyping);
                } catch (error) {
                    this.catchError(error, socket);
                }
            });
            socket.on('disconnect', () => {});
        });
    }
}
