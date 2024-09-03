import { otpCache } from '@root/services/redis/otp.cache';
import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import { BadRequestError } from '@root/helpers/error-handler';
import HTTP_STATUS from 'http-status-codes';
import { IOTPDocument } from '../interfaces/otp.interface';
import { Types } from 'mongoose';
import { generateEncryptedOtpToken, generateRandomOTP } from '@root/helpers/otp.v1';
import { otpQueue } from '@root/services/queues/otp.queue';
import { config } from '@root/config';
export const OTP_MAX_LENGTH = 6;
export class OTPController {
    public async verifyOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = `${req.currentUser!.userId}`;
            const encryptedOtp: string = req.body.encryptedOtp;
            if (!encryptedOtp) {
                throw new BadRequestError('OTP had expired!');
            }
            const otpData = await otpCache.getOtpFromCache(userId);
            if (!otpData) {
                throw new BadRequestError('OTP had expired!');
            }
            const { otp: currentOtp } = otpData!;
            const currentEncrypted = crypto.createHash('sha256').update(`${currentOtp.otpNumber}`).digest('hex');
            // Compare two encrypt otp
            if (!(encryptedOtp === currentEncrypted)) {
                throw new BadRequestError('OTP has expired!');
            }
            const otpToken = await generateEncryptedOtpToken(currentOtp);
            return res.status(HTTP_STATUS.OK).json({ message: 'Verify success.', otp: otpToken });
        } catch (error) {
            next(error);
        }
    }

    public async resendOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = `${req.currentUser!.userId}`;

            const currentOtp = await otpCache.getOtpFromCache(userId);
            if (!currentOtp) {
                throw new BadRequestError('OTP had expired!');
            }
            if (config.NODE_ENV === 'development') {
                console.log(currentOtp);
            } else {
                console.log('send email');
            }
            return res.status(HTTP_STATUS.OK).json({ message: 'Successfully resent OTP.' });
        } catch (error) {
            next(error);
        }
    }

    public async sendNewOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = `${req.currentUser!.userId}`;
            // Change otp
            const newOTP = {
                _id: new Types.ObjectId(),
                userId: new Types.ObjectId(userId),
                otpNumber: generateRandomOTP(OTP_MAX_LENGTH),
                maxOtpLength: OTP_MAX_LENGTH,
                createdAt: Date.now(),
                expiredAt: Date.now() + 180000, // expired after 3min
            } as IOTPDocument;

            otpQueue.addOtpToDB({ value: newOTP });
            await otpCache.addOtpToCache(userId, newOTP);
            if (config.NODE_ENV === 'development') {
                console.log(newOTP);
            } else {
                console.log('send email');
            }
            return res.status(HTTP_STATUS.OK).json({ message: 'Successfully send new OTP.' });
        } catch (error) {
            next(error);
        }
    }
}
