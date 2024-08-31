import { AuthModel } from '@root/features/auth/models/auth.schema';
import { BaseCache } from './base.cache';
import { userCache } from './user.cache';
import { userService } from '../db/user.services';
import { RoomModel } from '@root/features/rooms/models/room.schema';
import { roomCache } from './room.cache';

class RedisConnection extends BaseCache {
    constructor() {
        super('redisConnection');
    }
    public async connect(): Promise<void> {
        try {
            const allUsers = await AuthModel.find();
            await Promise.all(
                allUsers.map(async (authUser) => {
                    const user = await userService.getUserByAuthId(`${authUser._id}`);
                    // user cache
                    await userCache.saveUserToCache(`${user._id}`, user);
                }),
            );
            const allRooms = await RoomModel.find();
            await Promise.all(
                allRooms.map(async (room) => {
                    return roomCache.addRoomToCache(room);
                }),
            );
            await this.pingToRedis(this.client);
        } catch (error) {
            this.log.error(error);
        }
    }
}
export const redisConnection: RedisConnection = new RedisConnection();
