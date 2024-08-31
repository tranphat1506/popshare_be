import { config } from '@root/config';
import { IIdentityObject, IUserDocument } from '@root/features/users/interfaces/user.interface';
import { BadRequestError, NotAcceptableError, NotAuthorizedError } from '@root/helpers/error-handler';
import { authService } from '@root/services/db/auth.services';
import { userService } from '@root/services/db/user.services';
import { NextFunction, Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { generateToken, verifyToken } from '@root/helpers/jwt.helper';
import { AuthPayload } from '../interfaces/auth.interfaces';
import { authCache } from '@service/redis/auth.cache';
import { MESSAGE_RESPONSE_LIST } from '@root/helpers/error.constants';
import { generateRandomOTP, sendNewOtpWithUnauthorized, verifyEncryptedOtpToken } from '@root/helpers/otp.v1';
import crypto from 'crypto';
import { IOTPDocument } from '@root/features/otp/interfaces/otp.interface';
import { otpCache } from '@root/services/redis/otp.cache';
import { Types } from 'mongoose';
import { OTP_MAX_LENGTH } from '@root/features/otp/controllers/otp.controller';
import { otpQueue } from '@root/services/queues/otp.queue';
import { userCache } from '@root/services/redis/user.cache';
import { authQueue } from '@root/services/queues/auth.queue';
export class SignInController {
    // @joiValidation(regularSigninSchema)
    public async byIdentityObject(req: Request, res: Response, next: NextFunction) {
        try {
            const { password, rememberDevice, otpToken, ...rest } = req.body;
            const identity: IIdentityObject = rest;
            const authData = await authService.getUserByIdentityObject(identity);
            const userData = await userService.getUserByAuthId(`${authData._id}`);
            if (!authData) {
                throw new BadRequestError(`"user" ${MESSAGE_RESPONSE_LIST.invalidCredentials}`);
            }

            const passwordMatch: boolean = await authData.comparePassword(password);
            if (!passwordMatch) {
                throw new BadRequestError(`"user" ${MESSAGE_RESPONSE_LIST.invalidCredentials}`);
            }

            /**
             * If account not verify.
             * Client: keep login with otp code will auto verify user
             *  */
            if (!authData.isVerify) {
                if (!otpToken) await sendNewOtpWithUnauthorized(`${userData._id}`);
                else {
                    const currentOtp = await otpCache.getOtpFromCache(`${userData._id}`);
                    if (!currentOtp) await sendNewOtpWithUnauthorized(`${userData._id}`);
                    // verify OTP token on development environment
                    else if (config.NODE_ENV === 'development') {
                        console.log(currentOtp);
                        // Compare two encrypt otp
                        if (Number(otpToken) !== currentOtp?.otpNumber) {
                            throw new NotAuthorizedError(`"otp" ${MESSAGE_RESPONSE_LIST.invalidOtp}`);
                        }
                        // if success, update verify user
                        await userCache.updateUserByUserId(`${userData._id}`, 'isVerify', true);
                        authQueue.singleUpdateAuthDataByAuthId({
                            value: { authId: `${authData._id}`, field: 'isVerify', data: true },
                        });
                    } else {
                        const currentEncrypted = crypto
                            .createHash('sha256')
                            .update(`${currentOtp.otpNumber}`)
                            .digest('hex');
                        // Compare two encrypt otp
                        if (currentEncrypted !== otpToken) {
                            throw new NotAuthorizedError(`"otp" ${MESSAGE_RESPONSE_LIST.invalidOtp}`);
                        }
                        // if success, update verify user
                        await userCache.updateUserByUserId(`${userData._id}`, 'isVerify', true);
                        authQueue.singleUpdateAuthDataByAuthId({
                            value: { authId: `${authData._id}`, field: 'isVerify', data: true },
                        });
                    }
                }
            }

            const user: IUserDocument = await userService.getUserByAuthId(`${authData._id}`);
            const userJwt: string = await generateToken(
                { userId: user._id },
                config.JWT_ACCESS_TOKEN_SECRET,
                config.JWT_ACCESS_TOKEN_LIFETIME,
            );
            let rtoken: string | undefined = undefined;
            if (rememberDevice) {
                rtoken = await generateToken(
                    { userId: user._id },
                    config.JWT_REFRESH_TOKEN_SECRET,
                    config.JWT_REFRESH_TOKEN_LIFETIME,
                );
                await authCache.saveRefreshToken(rtoken, `${user._id.toString()}`);
            }
            const userDocument: IUserDocument = {
                ...user,
                authId: authData!._id,
                username: authData!.username,
                email: authData!.email,
                createdAt: authData!.createdAt,
            } as IUserDocument;
            return res.status(HTTP_STATUS.OK).json({
                message: 'User login successfully',
                user: userDocument,
                token: userJwt,
                rtoken,
            });
        } catch (error) {
            next(error);
        }
    }
    public async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const rtoken = req.body.rtoken;
            const userAgent = req.useragent;
            console.log(userAgent);
            if (!rtoken) {
                throw new NotAuthorizedError('Token is invalid. Please login again.');
            }
            const payload: AuthPayload = (await verifyToken(rtoken, config.JWT_REFRESH_TOKEN_SECRET)) as AuthPayload;
            // check refresh token is valid
            const isActiveRT = await authCache.checkIsActiveRefreshToken(rtoken, payload.userId);
            if (!isActiveRT) {
                throw new NotAuthorizedError('Token is invalid. Please login again.');
            }

            const aToken = await generateToken(
                { userId: payload.userId },
                config.JWT_ACCESS_TOKEN_SECRET,
                config.JWT_ACCESS_TOKEN_LIFETIME,
            );
            res.status(HTTP_STATUS.OK).json({ message: 'Refresh token successfully', token: aToken });
        } catch (error) {
            next(error);
        }
    }
}
