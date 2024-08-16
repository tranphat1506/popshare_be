import HTTP_STATUS from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { authCache } from '@root/services/redis/auth.cache';
import { verifyToken } from '@root/helpers/jwt.helper';
import { config } from '@root/config';
import { AuthPayload } from '../interfaces/auth.interfaces';

export class SignOutController {
    public async signout(req: Request, res: Response, next: NextFunction): Promise<any> {
        const token = req.headers.authorization?.split(' ')[1];
        const { rtoken } = req.body;
        try {
            if (!token || !rtoken)
                return res.status(HTTP_STATUS.OK).json({ message: 'Logout success.', user: {}, token: '', rtoken: '' });
            const { userId } = (await verifyToken(token, config.JWT_ACCESS_TOKEN_SECRET)) as AuthPayload;
            await authCache.revokedRefreshToken(rtoken, userId);
            return res.status(HTTP_STATUS.OK).json({ message: 'Logout success.', user: {}, token: '', rtoken: '' });
        } catch (error) {
            next(error);
        }
    }
}
