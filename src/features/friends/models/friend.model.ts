import { model, Model, Schema, Types } from 'mongoose';
import { IFriendDocument, RequestStatusEnum } from '../interfaces/friend.interface';

const friendSchema = new Schema({
    reciverId: { type: Types.ObjectId, ref: 'User', index: true },
    senderId: { type: Types.ObjectId, ref: 'User', index: true },
    requestTime: { type: Number },
    responseTime: { type: Number },
    status: { type: String, enum: RequestStatusEnum },
});

const FriendModel: Model<IFriendDocument> = model<IFriendDocument>('Friend', friendSchema, 'Friend');
export { FriendModel };
