import { config } from '@root/config';
import { IMessageDocument } from '@root/features/rooms/interfaces/message.interface';
import { IMemberDetail, IRoomDocument } from '@root/features/rooms/interfaces/room.interface';
import { MessageModel } from '@root/features/rooms/models/message.schema';
import { RoomModel } from '@root/features/rooms/models/room.schema';
import { Types } from 'mongoose';
const logger = config.createLogger('RoomServices');
class RoomServices {
    public async addRoomUserToDB(data: IRoomDocument): Promise<void> {
        await RoomModel.create(data);
    }

    public async getRoomByRoomId(roomId: Types.ObjectId | string): Promise<IRoomDocument | null> {
        return await RoomModel.findById(new Types.ObjectId(roomId));
    }

    public async getRoomByRoomIdAndMemberId(userId: string, roomId: string): Promise<IRoomDocument | null> {
        return await RoomModel.findOne({
            _id: roomId,
            'roomMembers.list': { $elemMatch: { memberId: new Types.ObjectId(userId) } },
        });
    }

    public async markAsSeenByMessagesIdList(userId: string, roomId: string, messagesIdList: string[]): Promise<void> {
        const result = await MessageModel.updateMany(
            {
                roomId: roomId,
                seenBy: { $nin: [userId] },
                _id: { $in: messagesIdList },
            },
            {
                $addToSet: { seenBy: userId },
            },
        );
        if (result.modifiedCount !== messagesIdList.length) {
            logger.error(
                `MARK AS SEEN BY MESSAGES ID LIST WAS UPDATE NOT COMPLETE::${result.modifiedCount}/${messagesIdList.length}`,
            );
        }
        return;
    }

    public async getAllRoomByMemberId(userId: string): Promise<IRoomDocument[]> {
        return await RoomModel.find({
            'roomMembers.list': { $elemMatch: { memberId: new Types.ObjectId(userId) } },
        });
    }

    public async getMessagesByPage(
        chatRoomId: Types.ObjectId | string,
        page: number,
        limit: number,
        beforeTimestamp?: number,
    ) {
        const query: any = { roomId: chatRoomId };
        if (beforeTimestamp) {
            query.createdAt = { $lt: beforeTimestamp };
        }
        const messages = await MessageModel.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('repliedTo');
        return messages;
    }

    public async checkIsValidToMessage(
        chatRoomId: Types.ObjectId | string,
        senderId: Types.ObjectId | string,
    ): Promise<unknown> {
        const room = await RoomModel.findById(chatRoomId, {
            'roomMembers.members': { $in: senderId },
        });
        if (!room) return false;
        if (room.messageSettings.allowMemberMessage) return true;
        const member: IMemberDetail = room.roomMembers.list.find((m) => m.memberId === senderId)!;
        if (member.position === 'owner' /* || member.permissionScore */) return true;
        return false;
    }

    public async createMessage(chatRoomId: Types.ObjectId | string, message: IMessageDocument) {
        await MessageModel.create({ ...message, roomId: chatRoomId });
    }
}

export const roomService = new RoomServices();
