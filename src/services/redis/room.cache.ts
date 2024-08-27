import {
    IMemberDetail,
    IMembersList,
    IRoomDocument,
    RoomActionTypes,
} from '@root/features/rooms/interfaces/room.interface';
import { BaseCache } from './base.cache';
import { ServerError } from '@root/helpers/error-handler';

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
            const members = await this.client.hget('room_members', `${roomId}`);
            const blocked = await this.client.hget('room_memebers_blocked', `${roomId}`);
            if (!members || !blocked) return { canAction: false, message: 'Cannot found this room.' };
            const blockedData = JSON.parse(blocked) as IMembersList;
            const membersData = JSON.parse(members) as IMembersList;
            const isBlockedUser = blockedData.list.find((m) => `${m.memberId}` === userId);
            const memberDetail = membersData.list.find((m) => `${m.memberId}` === userId);
            switch (action) {
                case 'socketJoin':
                    if (isBlockedUser || !memberDetail)
                        return { canAction: false, message: 'User was blocked from this room.' };
                    return { canAction: true, message: 'Success action.' };
                default:
                    return { canAction: false, message: 'User cannot action to this room.' };
            }
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public splitRoomData(room: IRoomDocument) {
        const room_detail = {
            roomName: room.roomName,
            roomType: room.roomType,
            createdAt: room.createdAt,
            createdBy: room.createdBy,
            messageSettings: room.messageSettings,
        } as IRoomDocument;

        const room_members = room.roomMembers;
        const room_blocked_members = room.roomBannedList;

        return { room_detail, room_members, room_blocked_members };
    }
}

export const roomCache = new RoomCache();
