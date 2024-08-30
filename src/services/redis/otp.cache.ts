import { IOTPDocument } from '@root/features/otp/interfaces/otp.interface';
import { BaseCache } from './base.cache';
import { ServerError } from '@root/helpers/error-handler';

class OTPCache extends BaseCache {
    constructor() {
        super('OTPCache');
    }

    public async addOtpToCache(userId: string, otp: IOTPDocument) {
        try {
            await this.client.hset(`otp`, `${userId}`, JSON.stringify(otp));
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getOtpFromCache(userId: string) {
        try {
            const data = await this.client.hget(`otp`, `${userId}`);
            if (!data) return null;
            const parse = JSON.parse(data) as IOTPDocument;
            if (Date.now() > parse.expiredAt) {
                await this.client.hdel(`otp`, `${userId}`);
                return null;
            }
            return parse as IOTPDocument;
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }
}
export const otpCache = new OTPCache();
