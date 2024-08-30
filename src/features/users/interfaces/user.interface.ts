import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
export interface IUserDocument extends Document {
    _id: string | ObjectId;
    // Auth schema
    authId: string | ObjectId;
    username?: string;
    email?: string;
    password?: string;
    createdAt?: Date;
    isVerify?: boolean;

    avatarEmoji: string;
    displayName: string;
    profilePicture: string;
    avatarColor: string;
    privacies: IPrivacySettings;
    notifications: INotificationSettings;
}

export interface IUserPublicDetail {
    _id: string | ObjectId;
    username: string;
    avatarEmoji: string;
    displayName: string;
    profilePicture: string;
    avatarColor: string;
    createdAt: Date;
    isVerify: boolean;
}
export interface INotificationSettings {
    messages: boolean;
    addFriends: boolean;
}
export interface IPrivacySettings {
    allowStrangerSendMessages: AllowStrangerSendMessageTypes;
}
type AllowStrangerSendMessageTypes = 'invite' | 'allow' | 'none';
export const AllowStrangerSendMessageEnum: AllowStrangerSendMessageTypes[] = ['allow', 'invite', 'none'];

export interface IUserJob {
    key?: string;
    value?: IUserDocument | string | INotificationSettings | IPrivacySettings;
}

export interface IIdentityObject {
    username?: string;
    email?: string;
}
