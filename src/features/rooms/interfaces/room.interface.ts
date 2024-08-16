import { Document, Types } from 'mongoose';

// Interface cho NotificationSettings
interface INotificationSettings {
    message: boolean;
    tag: boolean;
}
// Interface cho MemberDetail
export interface IMemberDetail {
    memberId: Types.ObjectId;
    position: MemberPositionTypes;
    permissionScore: number;
    joinedAt: number;
    displayName: string;
    notificationSettings: INotificationSettings;
}

// Interface cho MembersList
interface IMembersList {
    member: number;
    list: IMemberDetail[]; // Mảng các MemberDetail
}
interface IMessageSettings {
    allowMemberMessage: boolean;
    allowAutoJoin: boolean;
}
export interface IRoomDocument extends Document {
    _id: Types.ObjectId | string; // room id
    roomName: string;
    roomBannedList: IMembersList; // MembersList chứa danh sách cấm
    roomMembers: IMembersList; // MembersList chứa danh sách thành viên
    createdBy: Types.ObjectId | string;
    createdAt: number;
    messageSettings: IMessageSettings;
}
type MemberPositionTypes = 'owner' | 'member' | 'other';
export const MemberPositionEnum: MemberPositionTypes[] = ['member', 'other', 'owner'];
