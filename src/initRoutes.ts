import { Application, Request, Response } from 'express';
import { userRoutes } from '@root/features/users/routes/user.router';
import { authRoutes } from '@root/features/auth/routes/auth.router';
import { config } from './config';
import HTTP_STATUS from 'http-status-codes';
import { serverAdapter } from './services/queues/base.queue';
import { friendRoutes } from './features/friends/routes/friend.router';
import { authMiddleware } from './middlewares/auth.middleware';
import { roomRoutes } from './features/rooms/routes/room.router';
import { chatRoutes } from './features/rooms/routes/chat.router';
import { otpRouter } from './features/otp/routes/otp.router';
const BASE_PATH = `/api/${config.APP_VERSION}`;

export default (app: Application) => {
    const routes = () => {
        // auth routes
        app.use(BASE_PATH, authRoutes.routes());
        app.use(BASE_PATH, authRoutes.signoutRoute());

        // queue routes
        app.use('/admin/queues', authMiddleware.verifyUser, serverAdapter.getRouter());
        app.use(BASE_PATH + '/otp', authMiddleware.verifyUser, otpRouter.routes());
        app.use(BASE_PATH + '/user', authMiddleware.verifyUser, userRoutes.routes());
        app.use(BASE_PATH + '/friend', authMiddleware.verifyUser, friendRoutes.routes());
        app.use(BASE_PATH + '/room', authMiddleware.verifyUser, roomRoutes.routes());
        app.use(BASE_PATH + '/chat', authMiddleware.verifyUser, chatRoutes.routes());

        app.post(BASE_PATH, (req, res) => {
            return res.sendStatus(200);
        });

        // not found
        app.all('*', (req: Request, res: Response) => {
            res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
        });
    };
    routes();
};
