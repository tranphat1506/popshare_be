import { model, Model, Schema, Types } from 'mongoose';
import { EntityTypeEnum, INotificationDocument, NotificationTypeEnum } from '../interfaces/notifications.interface';

export const EntitySchema = new Schema({
    entityType: { type: String, required: true, enum: EntityTypeEnum },
    userId: { type: Types.ObjectId, ref: 'User', index: true },
    serverName: String,
    roomId: { type: Types.ObjectId, ref: 'Room', index: true },
    createdAt: { type: Number, default: Date.now() },
});

const NotificationSchema = new Schema({
    sender: EntitySchema,
    receiver: EntitySchema,
    notificationType: { type: String, enum: NotificationTypeEnum, default: 'others' },
    notificationMessages: { type: [String], default: [] },
    notificationReaders: { type: [EntitySchema], default: [] },
    otherContents: { type: Schema.Types.Mixed },
    createdAt: { type: Number, default: Date.now() },
});

const NotificationModel: Model<INotificationDocument> = model<INotificationDocument>(
    'Notification',
    NotificationSchema,
    'Notification',
);
export { NotificationModel };
