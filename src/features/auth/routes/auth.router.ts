import { SignInController } from '@auth/controllers/auth.signin';
import { SignOutController } from '@auth/controllers/auth.signout';
import { SignUpController } from '@auth/controllers/auth.signup';
import express, { Router } from 'express';

class AuthRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.post('/signup', SignUpController.prototype.createByEmail);
        this.router.post('/signin', SignInController.prototype.byIdentityObject);
        this.router.post('/refresh', SignInController.prototype.refreshToken);

        return this.router;
    }

    public signoutRoute(): Router {
        this.router.post('/signout', SignOutController.prototype.signout);

        return this.router;
    }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
