import { Document, Types } from 'mongoose';

export interface IFriendDocument extends Document {
    receiverInfo?: {
        username: string;
        displayName: string;
        avatarEmoji: string;
        profilePicture: string;
        avatarColor: string;
    };
    senderInfo?: {
        username: string;
        displayName: string;
        avatarEmoji: string;
        profilePicture: string;
        avatarColor: string;
    };
    receiverId: string | Types.ObjectId;
    senderId: string | Types.ObjectId;
    requestTime: number;
    responseTime?: number;
    status: RequestStatusTypes;
}

export type RequestStatusTypes = 'accepted' | 'pending';
export const RequestStatusEnum: RequestStatusTypes[] = ['accepted', 'pending'];

export interface IFriendsResponseData {
    count: number;
    friends: IFriendDocument[];
}

export interface IFriendJob {
    key1?: string;
    key2?: string;
    value?: string[] | string | IFriendDocument | IUpdateFriendRequest;
}

export interface IUpdateFriendRequest {
    responseTime?: number;
    status: RequestStatusTypes;
}
