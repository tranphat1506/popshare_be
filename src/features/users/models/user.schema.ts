import { Model, model, Schema, Types } from 'mongoose';
import { AllowStrangerSendMessageEnum, IUserDocument } from '../interfaces/user.interface';

const userSchema = new Schema({
    authId: { type: Types.ObjectId, ref: 'Auth', index: true },
    profilePicture: { type: String },
    avatarColor: { type: String },
    displayName: { type: String },
    avatarEmoji: { type: String },
    privacies: {
        allowStrangerSendMessages: {
            type: String,
            enum: AllowStrangerSendMessageEnum,
            default: 'allow',
        },
    },
    notifications: {
        messages: { type: Boolean, default: true },
        addFriends: { type: Boolean, default: true },
    },
});

const UserModel: Model<IUserDocument> = model<IUserDocument>('User', userSchema, 'User');
export { UserModel };
