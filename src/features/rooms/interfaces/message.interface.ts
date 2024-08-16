import { Document, Types } from 'mongoose';

type IMessageTypeTypes = 'text' | 'image' | 'video' | 'file';
export const MessageTypeEnum: IMessageTypeTypes[] = ['file', 'image', 'text', 'video'];

interface IReaction {
    data: string;
    senderId: string | Types.ObjectId;
    createdAt: number;
}
// Interface cho tin nhắn
export interface IMessageDocument extends Document {
    _id: Types.ObjectId | string; // id message
    roomId: Types.ObjectId | string; // ID của phòng chat
    senderId: Types.ObjectId | string; // Người gửi tin nhắn

    messageType: IMessageTypeTypes; // Loại tin nhắn
    content?: string; // Nội dung tin nhắn (dành cho tin nhắn văn bản)
    mediaUrl?: string; // URL của media (ảnh, video, file)

    reactions: IReaction[];
    seenBy: Types.ObjectId[] | string[]; // Danh sách người đã xem tin nhắn
    repliedTo?: Types.ObjectId | string; // ID của tin nhắn mà tin nhắn này đang trả lời

    createdAt: Number; // Thời gian gửi tin nhắn
    isEveryoneRecalled: boolean; // Nếu tất cả người dùng trong phòng đã thu hồi tin nhắn
    isSelfRecalled: boolean; // Nếu người gửi đã thu hồi tin nhắn
}
