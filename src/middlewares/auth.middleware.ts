import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../helpers/jwt.helper';
import { config } from '@root/config';
import { NotAuthorizedError, SocketEventError } from '@root/helpers/error-handler';
import { AuthPayload } from '@auth/interfaces/auth.interfaces';
import { Socket } from 'socket.io';
export class AuthMiddleware {
    public async verifyUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                throw new NotAuthorizedError('Token is invalid. Please login again.');
            }
            const payload: AuthPayload = (await verifyToken(token, config.JWT_ACCESS_TOKEN_SECRET)) as AuthPayload;
            req.currentUser = payload;
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
                throw new SocketEventError('auth', 'ERROR_NOT_AUTHORIZATION', { socketId: socket.id });
            }
            const token = socket.handshake.headers.authorization.split(' ')[1] as string;
            verifyToken<AuthPayload>(token, config.JWT_ACCESS_TOKEN_SECRET)
                .then((payload) => {
                    socket.user = { userId: `${payload.userId}` };
                })
                .catch((error) => {
                    throw new SocketEventError('auth', 'ERROR_NOT_AUTHORIZATION', { socketId: socket.id });
                });
            next();
        } catch (error) {
            next(error);
        }
    }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
