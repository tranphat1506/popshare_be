import express, { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';

class ChatRoutes {
    private router: Router;
    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.post('/getPerPage', ChatController.prototype.getMessagePerPageByRoomId);
        this.router.post('/send', ChatController.prototype.sendMessageToChatRoom);
        this.router.post('/markAsSeen', ChatController.prototype.markMessageAsSeen);
        return this.router;
    }
}

export const chatRoutes: ChatRoutes = new ChatRoutes();
