import { IOTPDocument } from '@root/features/otp/interfaces/otp.interface';
import { generateToken, verifyToken } from './jwt.helper';
import { config } from '@root/config';
import { NotAuthorizedError, ServerError } from './error-handler';
import { MESSAGE_RESPONSE_LIST } from './error.constants';
import { otpCache } from '@root/services/redis/otp.cache';
import { Types } from 'mongoose';
import { OTP_MAX_LENGTH } from '@root/features/otp/controllers/otp.controller';
import { otpQueue } from '@root/services/queues/otp.queue';

export function generateRandomOTP(length: number): number {
    let otp: string = '';

    for (let i = 0; i < length; i++) {
        // Tạo số ngẫu nhiên từ 0 đến 9
        const randomDigit: number = Math.floor(Math.random() * 10);
        otp += randomDigit.toString();
    }

    return Number(otp);
}

export function generateEncryptedOtpToken(otp: IOTPDocument) {
    return generateToken(otp, config.JWT_OTP_SECRET, undefined);
}

export async function verifyEncryptedOtpToken(otpToken: string) {
    try {
        return await verifyToken<IOTPDocument>(otpToken, config.JWT_OTP_SECRET);
    } catch (error) {
        throw new NotAuthorizedError(`"otp" ${MESSAGE_RESPONSE_LIST.invalidOtp}`);
    }
}

export async function sendNewOtpWithUnauthorized(userId: string) {
    try {
        let currentOtp = await otpCache.getOtpFromCache(userId);
        if (!currentOtp) {
            currentOtp = {
                _id: new Types.ObjectId(),
                otpNumber: generateRandomOTP(OTP_MAX_LENGTH),
                maxOtpLength: OTP_MAX_LENGTH,
                createdAt: Date.now(),
                expiredAt: Date.now() + 180000, // expired after 3min
            } as IOTPDocument;

            otpQueue.addOtpToDB({ value: currentOtp });
            await otpCache.addOtpToCache(userId, currentOtp);
        }

        if (config.NODE_ENV === 'development') {
            console.log(currentOtp);
        } else {
            console.log('send email', currentOtp);
        }
    } catch (error) {
        throw new ServerError(`"server" ${MESSAGE_RESPONSE_LIST.serverError}`);
    }
}
