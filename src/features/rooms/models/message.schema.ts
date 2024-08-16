import { model, Model, Schema, Types } from 'mongoose';
import { IMessageDocument, MessageTypeEnum } from '../interfaces/message.interface';

const ReactionSchema = new Schema({
    data: { type: String, required: true },
    senderId: { type: Types.ObjectId, ref: 'User' },
    createdAt: { type: Number, default: Date.now() },
});
const MessageSchema = new Schema({
    roomId: { type: Types.ObjectId, ref: 'Message' }, // ID của phòng
    senderId: { type: Types.ObjectId, ref: 'User' },
    isEveryoneRecalled: { type: Boolean, default: false },
    isSelfRecalled: { type: Boolean, default: false },
    messageType: { type: String, enum: MessageTypeEnum, required: true }, // Loại tin nhắn
    content: { type: String, required: false }, // Nội dung tin nhắn (dành cho tin nhắn văn bản)
    mediaUrl: { type: String, required: false }, // URL của media (ảnh, video, file)
    seenBy: { type: [{ type: Types.ObjectId, ref: 'User' }], default: [] },
    reactions: { type: [ReactionSchema], default: [] },
    createdAt: { type: Number, default: Date.now() }, // Thời gian gửi tin nhắn
    repliedTo: { type: Types.ObjectId, ref: 'Message', required: false }, // ID của tin nhắn mà tin nhắn này đang trả lời
});

const MessageModel: Model<IMessageDocument> = model<IMessageDocument>('Message', MessageSchema, 'Message');
export { MessageModel };
