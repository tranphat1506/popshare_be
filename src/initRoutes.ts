import { Application, Request, Response } from 'express';
import { userRoutes } from '@root/features/users/routes/user.router';
import { authRoutes } from '@root/features/auth/routes/auth.router';
import { config } from './config';
import HTTP_STATUS from 'http-status-codes';
import { serverAdapter } from './services/queues/base.queue';
const BASE_PATH = `/api/${config.APP_VERSION}`;

export default (app: Application) => {
    const routes = () => {
        // queue routes
        app.use('/admin/queues', serverAdapter.getRouter());
        // user routes
        app.use(BASE_PATH, userRoutes.routes());
        app.post(BASE_PATH, (req, res) => {
            return res.sendStatus(200);
        });
        // auth routes
        app.use(BASE_PATH, authRoutes.routes());
        app.use(BASE_PATH, authRoutes.signoutRoute());

        // not found
        app.all('*', (req: Request, res: Response) => {
            res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
        });
    };
    routes();
};
