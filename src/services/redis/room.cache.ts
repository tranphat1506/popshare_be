import {
    IMemberDetail,
    IMembersList,
    IRoomData,
    IRoomDocument,
    RoomActionTypes,
} from '@root/features/rooms/interfaces/room.interface';
import { BaseCache } from './base.cache';
import { ServerError } from '@root/helpers/error-handler';
import { IMessageDocument } from '@root/features/rooms/interfaces/message.interface';

class RoomCache extends BaseCache {
    constructor() {
        super('RoomCache');
    }

    public async addRoomToCache(room: IRoomDocument) {
        try {
            const { room_detail, room_blocked_members, room_members } = this.splitRoomData(room);
            await this.client.hset('rooms', `${room._id}`, JSON.stringify(room_detail));
            await this.client.hset('room_members', `${room._id}`, JSON.stringify(room_members));
            await this.client.hset('room_memebers_blocked', `${room._id}`, JSON.stringify(room_blocked_members));
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getRoomByRoomId(roomId: string) {
        try {
            const detail = await this.client.hget('rooms', `${roomId}`);
            const members = await this.client.hget('room_members', `${roomId}`);
            const blocked = await this.client.hget('room_memebers_blocked', `${roomId}`);
            if (!detail || !members || !blocked) {
                return null;
            }
            return {
                ...JSON.parse(detail),
                roomMembers: JSON.parse(members),
                roomBannedList: JSON.parse(blocked),
            } as IRoomDocument;
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async checkingPermit2ActionByUserId(userId: string, roomId: string, action: RoomActionTypes) {
        if (!userId || !roomId) return { canAction: false, message: 'Invalid userId or roomId' };
        try {
            const room = await this.client.hget('rooms', `${roomId}`);
            const members = await this.client.hget('room_members', `${roomId}`);
            const blocked = await this.client.hget('room_memebers_blocked', `${roomId}`);
            if (!room || !members || !blocked) return { canAction: false, message: 'Cannot found this room.' };
            const roomData = JSON.parse(room) as IRoomData;
            const blockedData = JSON.parse(blocked) as IMembersList;
            const membersData = JSON.parse(members) as IMembersList;
            const isBlockedUser = blockedData.list.find((m) => `${m.memberId}` === userId);
            const memberDetail = membersData.list.find((m) => `${m.memberId}` === userId);
            switch (action) {
                case 'socketJoin':
                case 'getMessage':
                    if (isBlockedUser || !memberDetail)
                        return { canAction: false, message: 'User was blocked on this room.' };
                    return { canAction: true, message: 'Success action.' };
                case 'sendMessage':
                    if (isBlockedUser || !memberDetail)
                        return { canAction: false, message: 'Room prevent this user to send message.' };
                    const roomPermit =
                        memberDetail?.position === 'owner' || !!roomData.messageSettings.allowMemberMessage;
                    if (!roomPermit) return { canAction: false, message: 'This room prevent user to send message.' };
                    return { canAction: true, message: 'Success action.' };
                default:
                    return { canAction: false, message: 'User cannot action on this room.' };
            }
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public splitRoomData(room: IRoomDocument) {
        const room_detail: IRoomData = {
            _id: room._id,
            roomName: room.roomName,
            roomType: room.roomType,
            createdAt: room.createdAt,
            createdBy: room.createdBy,
            messageSettings: room.messageSettings,
        };

        const room_members = room.roomMembers;
        const room_blocked_members = room.roomBannedList;

        return { room_detail, room_members, room_blocked_members };
    }

    public async addMessageToCache(message: IMessageDocument) {
        try {
            const roomId = `${message.roomId}`;
            // danh sach tin nhan
            await this.client.zadd(`message_history:${roomId}`, message.createdAt, `${message._id}`);
            await this.client.hset(`message_data`, `${message._id}`, JSON.stringify(message));
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getMessageFromCacheByMessageId(messageId: string) {
        try {
            const stringData = await this.client.hget(`message_data`, `${messageId}`);
            if (!stringData) return null;
            return JSON.parse(stringData) as IMessageDocument;
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getMessageByPage(roomId: string, page: number = 0, totalGet: number | undefined = 10) {
        try {
            if (!roomId) return null;
            // ZREVRANGE messages (n*10) ((n+1)*10-1) WITHSCORES
            const messageIdList = await this.client.zrevrange(
                `message_history:${roomId}`,
                page * totalGet,
                (page + 1) * totalGet - 1,
                'WITHSCORES',
            );
            if (messageIdList.length === 0) return null;
            const messages: IMessageDocument[] = [];
            for (const messageId of messageIdList) {
                const data = await this.getMessageFromCacheByMessageId(messageId);
                if (!data) continue;
                console.log(data);
                messages.push(data);
            }
            return messages.length === 0 ? null : messages;
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }
}

export const roomCache = new RoomCache();
