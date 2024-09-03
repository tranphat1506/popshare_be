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
import { sendNewOtpWithUnauthorized } from '@root/helpers/otp.v1';
import crypto from 'crypto';
import { otpCache } from '@root/services/redis/otp.cache';
import { userCache } from '@root/services/redis/user.cache';
import { authQueue } from '@root/services/queues/auth.queue';
import { joiValidation } from '@root/helpers/decorators/joi.decorators';
import { regularSignInSchema } from '../schemas/signin';
export class SignInController {
    @joiValidation(regularSignInSchema)
    public async byIdentityObject(req: Request, res: Response, next: NextFunction) {
        try {
            const { password, rememberDevice, otpToken, ...rest } = req.body;
            const identity: IIdentityObject = rest;
            const authData = await authService.getUserByIdentityObject(identity);
            if (!authData) {
                throw new BadRequestError(`"user" ${MESSAGE_RESPONSE_LIST.invalidCredentials}`);
            }
            const userData = await userService.getUserByAuthId(`${authData._id}`);

            const passwordMatch: boolean = await authData.comparePassword(password);
            if (!passwordMatch) {
                throw new BadRequestError(`"user" ${MESSAGE_RESPONSE_LIST.invalidCredentials}`);
            }

            /**
             * If account not verify.
             * Client: keep login with otp code will auto verify user
             *  */
            if (!authData.isVerify) {
                if (!otpToken) {
                    await sendNewOtpWithUnauthorized(`${userData._id}`);
                    throw new NotAcceptableError(`"user" ${MESSAGE_RESPONSE_LIST.userNotVerify}`);
                } else {
                    const otpData = await otpCache.getOtpFromCache(`${userData._id}`);
                    if (!otpData) {
                        await sendNewOtpWithUnauthorized(`${userData._id}`);
                        throw new NotAcceptableError(`"user" ${MESSAGE_RESPONSE_LIST.userNotVerify}`);
                    }
                    const { otp: currentOtp, handle: handleOtp } = otpData!;
                    // handle verify data
                    if (
                        handleOtp.wrongCount > 10 &&
                        handleOtp.lastAction &&
                        Date.now() < handleOtp.lastAction + 3 * 60 * 60 * 1000
                    ) {
                        throw new NotAuthorizedError(`"otp" ${MESSAGE_RESPONSE_LIST.otpTooManyRequest}}`);
                    }
                    handleOtp.lastAction = Date.now();
                    // verify OTP token on development environment
                    if (config.NODE_ENV === 'development') {
                        console.log(currentOtp);
                        // Compare two encrypt otp
                        if (otpToken !== currentOtp?.otpNumber) {
                            // If wrong
                            handleOtp.wrongCount += 1;
                            await otpCache.updateHandleGetOTP(`${userData._id}`, handleOtp);
                            throw new NotAuthorizedError(`"otp" ${MESSAGE_RESPONSE_LIST.invalidOtp}`);
                        }
                        // Set new for handle get otp
                        handleOtp.wrongCount = 0;
                        handleOtp.lastAction = undefined;
                        await otpCache.updateHandleGetOTP(`${userData._id}`, handleOtp);
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
                            // If wrong
                            handleOtp.wrongCount += 1;
                            await otpCache.updateHandleGetOTP(`${userData._id}`, handleOtp);
                            throw new NotAuthorizedError(`"otp" ${MESSAGE_RESPONSE_LIST.invalidOtp}`);
                        }
                        // Set new for handle get otp
                        handleOtp.wrongCount = 0;
                        handleOtp.lastAction = undefined;
                        await otpCache.updateHandleGetOTP(`${userData._id}`, handleOtp);
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
                isVerify: true, // always true because of only verify account data response for client
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
            if (!rtoken) {
                throw new NotAuthorizedError('Token is invalid. Please login again.');
            }
            const payload = await verifyToken<AuthPayload>(rtoken, config.JWT_REFRESH_TOKEN_SECRET);

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
