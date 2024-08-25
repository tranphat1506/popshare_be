import { Server, Socket } from 'socket.io';
import { BaseSocket } from './base.socket';
import { CommonSocketServerService } from './commonServices.socket';
import { ISocketChatRoomSetup } from '@root/features/rooms/interfaces/room.interface';
import { BadRequestError, SocketEventError } from '@root/helpers/error-handler';
import { SocketEventList } from './socketEvent.constant';

export let socketIORoom: Server;
export class RoomSocket extends BaseSocket {
    constructor(io: Server) {
        super(io, 'RoomSocket');
        socketIORoom = io;
    }
    public listen(): void {
        this.io.on('connection', (socket: Socket) => {
            socket.on(SocketEventList.onSetupChatRoom, async (data: ISocketChatRoomSetup) => {
                const currentSocketEvent = SocketEventList.onSetupChatRoom;
                try {
                    const rooms = data.roomIdList;
                    if (!rooms) throw new SocketEventError(currentSocketEvent, 'Invalid data.', { rooms });
                    await CommonSocketServerService.joinSocketChatRooms(socket, rooms);
                } catch (error) {
                    this.catchError(error, socket);
                }
            });
            socket.on('disconnect', () => {});
        });
    }
}
