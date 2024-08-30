import { IOtpJob } from '@root/features/otp/interfaces/otp.interface';
import { BaseQueue } from './base.queue';
import { otpWorker } from '../worker/otp.worker';
class OTPQueue extends BaseQueue {
    constructor() {
        super('OTPQueue');
        this.processJob('addOtpToDB', 5, otpWorker.addOtpToDB);
    }

    public async addOtpToDB(data: IOtpJob) {
        this.addJob('addOtpToDB', data);
    }
}

export const otpQueue = new OTPQueue();
