import { Application } from 'express';
import { userRoutes } from './features/users/routes/userRoutes';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
    const routes = () => {
        app.use(BASE_PATH, userRoutes.routes());
    };
    routes();
};
