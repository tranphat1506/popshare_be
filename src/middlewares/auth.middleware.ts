import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../helpers/jwt.helper';
import { config } from '@root/config';
import { NotAuthorizedError, SocketEventError } from '@root/helpers/error-handler';
import { AuthPayload } from '@auth/interfaces/auth.interfaces';
import { Socket } from 'socket.io';
import { SocketEventList } from '@root/services/sockets/socketEvent.constant';
import { userCache } from '@root/services/redis/user.cache';
import { CommonSocketServerService } from '@root/services/sockets/commonServices.socket';
export class AuthMiddleware {
    public async verifyUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                throw new NotAuthorizedError('Token is invalid. Please login again.');
            }
            const payload: AuthPayload = (await verifyToken(token, config.JWT_ACCESS_TOKEN_SECRET)) as AuthPayload;
            req.currentUser = payload;
            await userCache.addUserToOnlineState(`${payload.userId}`);
            next();
        } catch (error) {
            next(new NotAuthorizedError('Token is invalid. Please login again.'));
        }
    }

    public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
        if (!req.currentUser) {
            throw new NotAuthorizedError('Authentication is required to access this route.');
        }
        next();
    }

    public async verifyUserSocketIO(socket: Socket, next: (err?: any) => void) {
        try {
            if (!socket.handshake.headers.authorization) {
                throw new Error('ERROR_NOT_AUTHORIZATION');
            }
            const token = socket.handshake.headers.authorization.split(' ')[1] as string;
            const payload = await verifyToken<AuthPayload>(token, config.JWT_ACCESS_TOKEN_SECRET);
            socket.user = { userId: `${payload.userId}` };
            next();
        } catch (error) {
            socket.emit(
                SocketEventList.sendSocketRequestError,
                new SocketEventError('auth', 'ERROR_NOT_AUTHORIZATION', {
                    socketId: socket.id,
                    error: error,
                }).serializeErrors(),
            );
            next(error);
        }
    }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
