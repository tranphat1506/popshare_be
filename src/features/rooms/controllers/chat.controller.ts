import { NextFunction, Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import {
    IMessageDocument,
    ICreateMessagePayload,
    IReaction,
    IGetMessagePayload,
    IMarkAsSeenProps,
} from '../interfaces/message.interface';
import { BadRequestError } from '@root/helpers/error-handler';
import { chatQueue } from '@root/services/queues/chat.queue';
import { Types } from 'mongoose';
import { roomCache } from '@root/services/redis/room.cache';
import { socketIORoom } from '@root/services/sockets/room.socket';
import { SocketEventList } from '@root/services/sockets/socketEvent.constant';
import { roomService } from '@root/services/db/room.services';

export class ChatController {
    public async getMessagePerPageByRoomId(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = `${req.currentUser!.userId}`;
            const messageData: IGetMessagePayload = { ...req.body };
            if (!messageData.roomId || messageData.page === undefined) {
                throw new BadRequestError('Bad request.');
            }
            const { canAction, message: permitMessage } = await roomCache.checkingPermit2ActionByUserId(
                userId,
                `${messageData.roomId}`,
                'getMessage',
            );
            if (!canAction) {
                throw new BadRequestError(permitMessage);
            }
            const messages = await roomCache.getMessageByPage(
                messageData.roomId,
                messageData.page,
                messageData.totalGet,
            );
            if (messages === null || messages.length === 0) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Empty messages', messages: [] });
            }
            return res.status(HTTP_STATUS.OK).json({ message: 'Successfully get messages on this room.', messages });
        } catch (error) {
            next(error);
        }
    }
    public async sendMessageToChatRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = `${req.currentUser!.userId}`;
            const messageData: ICreateMessagePayload = { ...req.body, senderId: userId };
            let newMessage: IMessageDocument;
            if (!messageData.roomId || !messageData.messageType) {
                throw new BadRequestError('Bad request.');
            }
            switch (messageData.messageType) {
                case 'text':
                    const message = messageData.content?.trim();
                    const { canAction, message: permitMessage } = await roomCache.checkingPermit2ActionByUserId(
                        userId,
                        `${messageData.roomId}`,
                        'sendMessage',
                    );
                    // No message content
                    // checking permission
                    if (!message || !canAction) {
                        throw new BadRequestError(!message ? 'Bad request.' : permitMessage);
                    }
                    newMessage = {
                        _id: new Types.ObjectId(),
                        roomId: new Types.ObjectId(messageData.roomId),
                        senderId: new Types.ObjectId(messageData.senderId),
                        messageType: messageData.messageType,
                        content: message,
                        reactions: [] as IReaction[],
                        seenBy: [new Types.ObjectId(userId)] as Types.ObjectId[],
                        repliedTo: messageData.repliedTo ? new Types.ObjectId(messageData.repliedTo) : null,
                        createdAt: Date.now(),
                        isEveryoneRecalled: false,
                        isSelfRecalled: false,
                    } as IMessageDocument;
                    // add to cache
                    await roomCache.addMessageToCache(newMessage);
                    // add to db
                    chatQueue.addMesesageJob({
                        value: newMessage,
                    });
                    // socket
                    socketIORoom.to(`${messageData.roomId}`).emit(SocketEventList.sendMessage, newMessage);
                    res.status(HTTP_STATUS.OK).json({
                        message: 'Successfully send a messsage.',
                        newMessage: newMessage,
                    });
                    break;
                default:
                    throw new BadRequestError('Invalid message type!');
            }
        } catch (error) {
            next(error);
        }
    }

    public async markMessageAsSeen(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = `${req.currentUser!.userId}`;
            const roomId = req.body.roomId;
            if (!roomId) throw new BadRequestError('Bad request.');
            const { canAction, message: permitMessage } = await roomCache.checkingPermit2ActionByUserId(
                userId,
                `${roomId}`,
                'getMessage',
            );
            if (!canAction) {
                throw new BadRequestError(permitMessage);
            }
            const messagesJustSeen = await roomCache.markMessageAsSeen(userId, {
                field: 'seenBy',
                data: userId,
                roomId: roomId,
            });
            if (messagesJustSeen === null) throw new BadRequestError('Bad request.');
            chatQueue.markMessageAsSeenJob({
                value: { userId: userId, roomId: roomId, messagesIdList: messagesJustSeen },
            });
            socketIORoom.to(roomId).emit(SocketEventList.sendSeenStatus, {
                userId: userId,
                roomId: roomId,
                messagesIdList: messagesJustSeen,
            } as IMarkAsSeenProps);
            return res.status(200).json({
                message: 'Success seen the last message',
            });
        } catch (error) {
            next(error);
        }
    }
}
