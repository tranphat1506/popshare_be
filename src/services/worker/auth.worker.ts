import { DoneCallback, Job } from 'bull';
import { LoggerBase } from '@root/config';
import { authService } from '@service/db/auth.services';
import { UpdateAuthDocumentProps } from '@root/features/auth/interfaces/auth.interfaces';

class AuthWorker extends LoggerBase {
    constructor() {
        super('authWorker');
    }
    async addAuthUserToDB(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { value } = job.data;
            await authService.addAuthUserToDB(value);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            this.log.error(error);
            done(error as Error);
        }
    }
    async singleUpdateAuthDataByAuthId(job: Job, done: DoneCallback): Promise<void> {
        try {
            const data: UpdateAuthDocumentProps = job.data.value;
            await authService.singleUpdateAuthDataByAuthId(data.authId, data.field, data.data);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            this.log.error(error);
            done(error as Error);
        }
    }
}

export const authWorker: AuthWorker = new AuthWorker();
