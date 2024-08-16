import { config } from '@root/config';
import { IIdentityObject, IUserDocument } from '@root/features/users/interfaces/user.interface';
import { BadRequestError, NotAuthorizedError } from '@root/helpers/error-handler';
import { authService } from '@root/services/db/auth.services';
import { userService } from '@root/services/db/user.services';
import { NextFunction, Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { generateToken, verifyToken } from '@root/helpers/jwt.helper';
import { AuthPayload } from '../interfaces/auth.interfaces';
import { authCache } from '@service/redis/auth.cache';
export class SignInController {
    public async byIdentityObject(req: Request, res: Response, next: NextFunction) {
        try {
            const { password, rememberDevice, ...rest } = req.body;
            const identity: IIdentityObject = rest;
            const existUser = await authService.getUserByIdentityObject(identity);
            if (!existUser) {
                throw new BadRequestError('Invalid credentials');
            }

            const passwordMatch: boolean = await existUser.comparePassword(password);
            if (!passwordMatch) {
                throw new BadRequestError('Invalid credentials');
            }

            const user: IUserDocument = await userService.getUserByAuthId(`${existUser._id}`);
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
                authId: existUser!._id,
                username: existUser!.username,
                email: existUser!.email,
                createdAt: existUser!.createdAt,
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
