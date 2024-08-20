import {
    IFriendDocument,
    IFriendsResponseData,
    IUpdateFriendRequest,
} from '@root/features/friends/interfaces/friend.interface';
import { FriendModel } from '@root/features/friends/models/friend.model';
import { Types } from 'mongoose';
class FriendServices {
    public async getAllFriendRequestByUserId(userId: string): Promise<IFriendsResponseData> {
        const friends = await FriendModel.find({
            $or: [
                {
                    receiverId: userId,
                },
                { senderId: userId },
            ],
        });
        return { count: friends.length, friends };
    }
    public async getAllAcceptedFriendsByUserId(userId: string): Promise<IFriendsResponseData> {
        const friends = await FriendModel.find({
            $or: [
                {
                    receiverId: userId,
                },
                { senderId: userId },
            ],
            status: 'accepted',
        });
        return { count: friends.length, friends };
    }

    public async getAllPendingFriendsByUserId(userId: string): Promise<IFriendsResponseData> {
        const friends = await FriendModel.find({
            $or: [
                {
                    receiverId: userId,
                },
                { senderId: userId },
            ],
            status: 'pending',
        });
        return { count: friends.length, friends };
    }

    public async addFriend(senderId: string, receiverId: string): Promise<null | IFriendDocument> {
        const friendRequest = await this.getFriendRequestBetweenTwo(senderId, receiverId);
        if (friendRequest === null) {
            return await FriendModel.create({
                receiverId: receiverId,
                senderId: senderId,
                status: 'pending',
            });
        }
        if (friendRequest.status === 'pending' && friendRequest.senderId.toString() === receiverId) {
            friendRequest.status = 'accepted';
            return await friendRequest.save();
        }
        return friendRequest;
    }

    public async unFriend(user1Id: string, user2Id: string): Promise<boolean> {
        return !!(await FriendModel.findOneAndDelete({
            $or: [
                {
                    senderId: user1Id,
                    receiverId: user2Id,
                },
                {
                    senderId: user2Id,
                    receiverId: user1Id,
                },
            ],
        }));
    }

    public async createFriendRequest(request: IFriendDocument): Promise<IFriendDocument> {
        return await FriendModel.create(request);
    }

    public async updateFriendRequest(
        senderId: string,
        receiverId: string,
        updates: IUpdateFriendRequest,
    ): Promise<IFriendDocument | null> {
        return await FriendModel.findOneAndUpdate(
            {
                $or: [
                    {
                        senderId: senderId,
                        receiverId: receiverId,
                    },
                    {
                        senderId: receiverId,
                        receiverId: senderId,
                    },
                ],
            },
            { $set: updates },
            { new: true, runValidators: true },
        );
    }

    public async getFriendRequestBetweenTwo(user1Id: string, user2Id: string): Promise<IFriendDocument | null> {
        return await FriendModel.findOne({
            $or: [
                {
                    receiverId: user1Id,
                    senderId: user2Id,
                },
                {
                    receiverId: user2Id,
                    senderId: user1Id,
                },
            ],
        });
    }
}

export const friendService = new FriendServices();
