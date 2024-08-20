import express, { Router } from 'express';
import { GetUserController } from '../controllers/get.users';
import { authMiddleware } from '@root/middlewares/auth.middleware';

class UserRoutes {
    private router: Router;
    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.post('/user', GetUserController.prototype.all);
        this.router.post('/me', authMiddleware.verifyUser, GetUserController.prototype.me);
        return this.router;
    }
}

export const userRoutes: UserRoutes = new UserRoutes();
