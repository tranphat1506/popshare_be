import express, { Router } from 'express';
import { GetUserController } from '../controllers/get.users';

class UserRoutes {
    private router: Router;
    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.get('/user', GetUserController.prototype.all);
        return this.router;
    }
}

export const userRoutes: UserRoutes = new UserRoutes();
