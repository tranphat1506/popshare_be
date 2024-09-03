import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';
declare global {
    namespace Express {
        interface Request {
            currentUser?: AuthPayload;
        }
    }
}
export interface AuthPayload {
    userId: ObjectId | string;
    iat?: number;
}
export interface IRegularSignUpData {
    _id: ObjectId;
    username: string;
    email: string;
    password: string;
    avatarEmoji: string;
    profilePicture?: string;
    displayName: string;
    avatarColor: string;
}
export interface IAuthDocument extends Document {
    _id: string | ObjectId;
    username: string;
    email: string;
    password?: string;
    createdAt: number;
    isVerify: boolean;
    comparePassword(password: string): Promise<boolean>;
    hashPassword(password: string): Promise<string>;
}

export interface UpdateAuthDocumentProps {
    authId: string;
    field: keyof IAuthDocument;
    data: any;
}
export interface IAuthJob {
    value?: IAuthDocument | string | UpdateAuthDocumentProps;
}
