import { IUserDocument } from '@root/features/users/interfaces/user.interface';
import { UserModel } from '@root/features/users/models/user.schema';
import mongoose from 'mongoose';

class UserServices {
    async addUserToDB(user: IUserDocument): Promise<void> {
        await UserModel.create(user);
    }

    async getUserByAuthId(authId: string): Promise<IUserDocument> {
        const users: IUserDocument[] = await UserModel.aggregate([
            { $match: { authId: new mongoose.Types.ObjectId(authId) } },
            { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
            { $unwind: '$authId' },
            { $project: this.aggregateProject() },
        ]);
        return users[0];
    }
    async getUserByUserId(userId: string): Promise<IUserDocument | null> {
        const users: IUserDocument[] = await UserModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(userId) } },
            { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
            { $unwind: '$authId' },
            { $project: this.aggregateProject() },
        ]);
        return users.length === 0 ? null : users[0];
    }

    private aggregateProject() {
        return {
            _id: 1,
            username: '$authId.username',
            email: '$authId.email',
            createdAt: '$authId.createdAt',
            isVerify: '$authId.isVerify',
            displayName: 1,
            notifications: 1,
            privacies: 1,
            profilePicture: 1,
            avatarEmoji: 1,
            avatarColor: 1,
        };
    }
}
export const userService = new UserServices();
