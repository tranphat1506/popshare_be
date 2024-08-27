import express, { Router } from 'express';
import { RoomController } from '../controllers/room.cotroller';

class RoomRoutes {
    private router: Router;
    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.post('/myChatRoom', RoomController.prototype.getAllChatRoom);
        return this.router;
    }
}

export const roomRoutes: RoomRoutes = new RoomRoutes();
