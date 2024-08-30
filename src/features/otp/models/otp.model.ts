import { model, Model, Schema, Types } from 'mongoose';
import { IOTPDocument } from '../interfaces/otp.interface';

const otpSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', index: true },
    otpNumber: { type: Number, required: true },
    maxOtpLength: { type: Number, required: true },
    expiredAt: { type: Number, required: true },
    createdAt: { type: Number, default: Date.now() },
});

// Add methods
otpSchema.methods.validOtpNumber = function (otp: number): boolean {
    const maxOtpLength: number = (this as unknown as IOTPDocument).maxOtpLength!;
    return `${otp}`.length === maxOtpLength;
};

const OTPModel: Model<IOTPDocument> = model<IOTPDocument>('OTP', otpSchema, 'OTP');
export { OTPModel };
