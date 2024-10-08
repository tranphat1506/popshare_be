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
    displayName?: string;
    notificationSettings: INotificationSettings;
}

// Interface cho MembersList
export interface IMembersList {
    member: number;
    list: IMemberDetail[]; // Mảng các MemberDetail
}
interface IMessageSettings {
    allowMemberMessage: boolean;
    allowAutoJoin: boolean;
}

export interface IRoomData {
    _id: Types.ObjectId | string; // room id
    roomName?: string;
    createdBy: Types.ObjectId | string;
    createdAt: number;
    messageSettings: IMessageSettings;
    roomType: RoomTypeTypes;
}
export interface IRoomDocument extends Document {
    _id: Types.ObjectId | string; // room id
    roomName?: string;
    roomBannedList: IMembersList; // MembersList chứa danh sách cấm
    roomMembers: IMembersList; // MembersList chứa danh sách thành viên
    createdBy: Types.ObjectId | string;
    createdAt: number;
    messageSettings: IMessageSettings;
    roomType: RoomTypeTypes;
}
type MemberPositionTypes = 'owner' | 'member' | 'other';
export const MemberPositionEnum: MemberPositionTypes[] = ['member', 'other', 'owner'];

type RoomTypeTypes = 'cloud' | 'group' | 'p2p';
export const RoomTypeEnum: RoomTypeTypes[] = ['cloud', 'group', 'p2p'];
export interface ISocketChatRoomSetup {
    roomIdList?: string[];
}
export interface IRoomJob {
    value?: IRoomDocument | string;
}

export type RoomActionTypes = 'socketJoin' | 'kickMember' | 'sendMessage' | 'getMessage' | 'seen';
