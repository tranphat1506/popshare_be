import { joiValidation } from '@root/helpers/decorators/joi.decorators';
import { regularSignupSchema } from '../schemas/signup';
import { NextFunction, Request, Response } from 'express';
import { IAuthDocument, IRegularSignUpData } from '../interfaces/auth.interfaces';
import { authService } from '@root/services/db/auth.services';
import { BadRequestError } from '@root/helpers/error-handler';
import { ObjectId } from 'mongodb';
import { Helpers } from '@root/helpers/helpers';
import { IUserDocument } from '@root/features/users/interfaces/user.interface';
import { userCache } from '@root/services/redis/user.cache';
import { authQueue } from '@root/services/queues/auth.queue';
import { userQueue } from '@root/services/queues/user.queue';
import { generateToken } from '@helpers/jwt.helper';
import { config } from '@root/config';
import HTTP_STATUS from 'http-status-codes';
import { sendNewOtpWithUnauthorized } from '@root/helpers/otp.v1';
export class SignUpController {
    @joiValidation(regularSignupSchema)
    public async createByEmail(req: Request, res: Response, next: NextFunction) {
        const { username, password, email, avatarColor, displayName, avatarEmoji } = req.body;
        try {
            const checkIfUserExist: IAuthDocument | null = await authService.getUserByIdentityObject({
                username,
                email,
            });
            if (checkIfUserExist?.username === username) throw new BadRequestError(`"username" ERROR_ALREADY_EXIST`);
            if (checkIfUserExist?.email === email) throw new BadRequestError(`"email" ERROR_ALREADY_EXIST`);

            const authObjectId: ObjectId = new ObjectId();
            const userObjectId: ObjectId = new ObjectId();

            const authData: IAuthDocument = SignUpController.prototype.generateSignupData({
                _id: authObjectId,
                username,
                email,
                password,
                avatarColor,
                displayName,
                avatarEmoji,
            });

            const userData: IUserDocument = SignUpController.prototype.generateUserData(
                {
                    _id: authObjectId, // NOTE: it's not the user id
                    username,
                    email,
                    password,
                    avatarColor,
                    displayName,
                    avatarEmoji,
                },
                userObjectId,
            );

            // add to redis cache
            await userCache.saveUserToCache(`${userObjectId}`, userData);
            // send verify account otp
            await sendNewOtpWithUnauthorized(`${userObjectId}`);
            // Add to database
            authQueue.addAuthUserJob('addAuthUserToDB', { value: authData });
            userQueue.addUserJob('addUserToDB', { value: userData });

            const userJwt: string = await generateToken(
                { userId: userData._id },
                config.JWT_ACCESS_TOKEN_SECRET,
                config.JWT_ACCESS_TOKEN_LIFETIME,
            );
            return res
                .status(HTTP_STATUS.CREATED)
                .json({ message: 'User created successfully', user: userData, token: userJwt });
        } catch (error) {
            next(error);
        }
    }

    private generateSignupData(data: IRegularSignUpData): IAuthDocument {
        const { _id, username, email, password } = data;
        return {
            _id,
            username: Helpers.lowerCase(username),
            email: Helpers.lowerCase(email),
            password,
            createdAt: Date.now(),
            isVerify: false,
        } as IAuthDocument;
    }

    private generateUserData(data: IRegularSignUpData, userObjectId: ObjectId): IUserDocument {
        const { _id, displayName, profilePicture, avatarColor, avatarEmoji, username, email } = data;
        return {
            _id: userObjectId,
            username,
            email,
            authId: _id,
            displayName,
            profilePicture,
            avatarColor,
            avatarEmoji,
            isVerify: false,
            notifications: {
                messages: true,
                addFriends: true,
            },
            privacies: {
                allowStrangerSendMessages: 'allow',
            },
        } as unknown as IUserDocument;
    }
}
