import { NextFunction, Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import {
    IMessageDocument,
    ICreateMessagePayload,
    IReaction,
    IGetMessagePayload,
    IMarkAsSeenProps,
    ISendMessagePayload,
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
            const payload = req.body as ISendMessagePayload;
            if (!payload.socketId || !payload.messages) {
                throw new BadRequestError('Bad request.');
            }
            const messagesData: ICreateMessagePayload[] = payload.messages;
            const createdMessages: (IMessageDocument & { tempId: string })[] = [];
            for (const data of messagesData) {
                let newMessage: IMessageDocument;
                const messageData: ICreateMessagePayload = { ...data, senderId: userId };
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
                        createdMessages.push({ ...newMessage, tempId: messageData.tempId } as IMessageDocument & {
                            tempId: string;
                        });
                        break;
                    default:
                        throw new BadRequestError('Invalid message type!');
                }
            }
            // socket
            socketIORoom
                .to(`${payload.roomId}`)
                .emit(SocketEventList.sendMessage, { messages: createdMessages, socketId: payload.socketId });
            return res.status(HTTP_STATUS.OK).json({
                message: 'Successfully send a messsage.',
                messages: createdMessages,
            });
        } catch (error) {
            next(error);
        }
    }

    public async markMessageAsSeen(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = `${req.currentUser!.userId}`;
            const roomId = req.body.roomId;
            const notRead = req.body.notRead;
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
            if (messagesJustSeen.length === 0) {
                if (notRead) {
                    chatQueue.markMessageAsSeenJob({
                        value: { userId: userId, roomId: roomId, messagesIdList: null },
                    });
                }
                return res.status(200).json({
                    message: 'Success seen the last message',
                });
            }
            chatQueue.markMessageAsSeenJob({
                value: { userId: userId, roomId: roomId, messagesIdList: null },
            });
            socketIORoom.to(roomId).emit(SocketEventList.sendSeenStatus, {
                userId: userId,
                roomId: roomId,
                messagesIdList: messagesJustSeen,
            } as IMarkAsSeenProps);
            console.log(messagesJustSeen);

            return res.status(200).json({
                message: 'Success seen the last message',
            });
        } catch (error) {
            next(error);
        }
    }
}
