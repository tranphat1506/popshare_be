import { IOTPDocument } from '@root/features/otp/interfaces/otp.interface';
import { OTPModel } from '@root/features/otp/models/otp.model';

class OTPServices {
    public async addOtpToDB(otp: IOTPDocument) {
        return await OTPModel.create(otp);
    }
}

export const otpService = new OTPServices();
