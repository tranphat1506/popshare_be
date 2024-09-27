import { Document, Types } from 'mongoose';

export type NotificationTypeTypes = 'friend_request' | 'message' | 'others' | 'security' | 'broadcast';
export const NotificationTypeEnum: NotificationTypeTypes[] = [
    'broadcast',
    'friend_request',
    'message',
    'others',
    'security',
];

export type EntityTypeTypes = 'user' | 'server' | 'room';
export const EntityTypeEnum: EntityTypeTypes[] = ['room', 'server', 'user'];

export interface IEntity {
    entityType: EntityTypeTypes;
    userId?: Types.ObjectId | string;
    serverName?: string;
    roomId?: Types.ObjectId | string;
    createdAt?: number;
}

export interface INotificationDocument extends Document {
    _id: Types.ObjectId | string;
    sender: IEntity;
    receiver: IEntity;
    notificationType: NotificationTypeTypes;
    notificationMessages: string[];
    notificationReaders: IEntity[];
    otherContents: any;
    createdAt: number;
}

export interface ISocketNotificationRoomSetup {
    userId?: string;
}

export interface INotiJob {
    value?: string | INotificationDocument;
}
