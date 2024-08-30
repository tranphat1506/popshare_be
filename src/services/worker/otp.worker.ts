import { LoggerBase } from '@root/config';
import { DoneCallback, Job } from 'bull';
import { otpService } from '../db/otp.services';

class OTPWorker extends LoggerBase {
    constructor() {
        super('otpWorker');
    }
    async addOtpToDB(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { value } = job.data;
            await otpService.addOtpToDB(value);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            this.log.error(error);
            done(error as Error);
        }
    }
}

export const otpWorker = new OTPWorker();
