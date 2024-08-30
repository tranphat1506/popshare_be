import { Types } from 'mongoose';

export interface IOTPDocument extends Document {
    _id: Types.ObjectId | string;
    otpNumber: number;
    maxOtpLength: number;
    createdAt: number;
    expiredAt: number;
    validOtpNumber(otp: string): boolean;
}

export interface IOtpJob {
    value?: IOTPDocument;
}
