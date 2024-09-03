import { Types } from 'mongoose';

export interface IOTPDocument extends Document {
    _id: Types.ObjectId | string;
    userId: Types.ObjectId | string;
    otpNumber: string;
    maxOtpLength: number;
    createdAt: number;
    expiredAt: number;
    validOtpNumber(otp: string): boolean;
}

export interface IOTPHandleGet {
    otpId: string;
    userId: string;
    lastAction?: number;
    wrongCount: number;
}

export interface IOtpJob {
    value?: IOTPDocument;
}
