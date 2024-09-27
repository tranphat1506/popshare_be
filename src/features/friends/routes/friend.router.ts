import express, { Router } from 'express';
import { GetFriendController } from '../controllers/get.controller';
import { FriendMethodController } from '../controllers/method.controller';

class FriendRoutes {
    private router: Router;
    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.post('/all', GetFriendController.prototype.all);
        this.router.post('/getByUserId', GetFriendController.prototype.getFriendRequestByUserId);
        this.router.post('/filter/:status', GetFriendController.prototype.byStatusFilter);
        this.router.post('/add', FriendMethodController.prototype.addFriendMethod);
        this.router.post('/un', FriendMethodController.prototype.unFriendMethod);

        return this.router;
    }
}

export const friendRoutes: FriendRoutes = new FriendRoutes();
