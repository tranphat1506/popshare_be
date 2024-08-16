import { model, Model, Schema, Types } from 'mongoose';
import { IRoomDocument, MemberPositionEnum } from '../interfaces/room.interface';

const MemberDetailSchema = new Schema({
    memberId: { type: Types.ObjectId, ref: 'User', index: true },
    position: { type: String, enum: MemberPositionEnum, default: 'member' },
    permissionScore: { type: Number, default: 0 },
    joinedAt: { type: Number, default: Date.now() },
    displayName: { type: String },
    notificationSettings: {
        message: { type: Boolean, default: true },
        tag: { type: Boolean, default: true },
    },
});
const MembersListSchema = new Schema({
    member: { type: Number, required: true },
    list: { type: [MemberDetailSchema], default: [] },
});
const RoomSchema = new Schema({
    roomName: String,
    roomBannedList: MembersListSchema,
    roomMembers: MembersListSchema,
    createdBy: { type: Types.ObjectId, ref: 'User', index: true },
    createdAt: { type: Number, default: Date.now() },
    messageSettings: {
        allowMemberMessage: { type: Boolean, default: true },
        allowAutoJoin: { type: Boolean, default: true },
    },
});

const RoomModel: Model<IRoomDocument> = model<IRoomDocument>('Room', RoomSchema, 'Room');
export { RoomModel };
