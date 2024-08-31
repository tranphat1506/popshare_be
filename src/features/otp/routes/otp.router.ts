import express, { Router } from 'express';
import { OTPController } from '../controllers/otp.controller';

class OtpRouter {
    private router: Router;
    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.post('/send', OTPController.prototype.sendNewOtp);
        this.router.post('/resend', OTPController.prototype.resendOtp);
        this.router.post('/verify', OTPController.prototype.verifyOtp);

        return this.router;
    }
}

export const otpRouter: OtpRouter = new OtpRouter();
