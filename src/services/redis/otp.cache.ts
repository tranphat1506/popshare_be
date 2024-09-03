import { IOTPDocument, IOTPHandleGet } from '@root/features/otp/interfaces/otp.interface';
import { BaseCache } from './base.cache';
import { ServerError } from '@root/helpers/error-handler';

class OTPCache extends BaseCache {
    constructor() {
        super('OTPCache');
    }

    public async addOtpToCache(userId: string, otp: IOTPDocument) {
        try {
            const otpHandle: IOTPHandleGet = {
                userId: userId,
                otpId: `${otp._id}`,
                wrongCount: 0,
                lastAction: undefined,
            };
            await this.client.hset(`handle_otp`, `${userId}`, JSON.stringify(otpHandle));
            await this.client.hset(`otp`, `${userId}`, JSON.stringify(otp));
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getOtpFromCache(userId: string) {
        try {
            const handleData = await this.client.hget(`handle_otp`, `${userId}`);
            const otpData = await this.client.hget(`otp`, `${userId}`);
            if (!otpData || !handleData) return null;
            const otp = JSON.parse(otpData) as IOTPDocument;
            const handle = JSON.parse(handleData) as IOTPHandleGet;
            if (Date.now() > otp.expiredAt) {
                await this.client.hdel(`otp`, `${userId}`);
                await this.client.hdel(`handle_otp`, `${userId}`);
                return null;
            }
            return { otp, handle };
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async updateHandleGetOTP(userId: string, handleOTP: IOTPHandleGet) {
        try {
            await this.client.hset(`handle_otp`, `${userId}`, JSON.stringify(handleOTP));
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }
}
export const otpCache = new OTPCache();
