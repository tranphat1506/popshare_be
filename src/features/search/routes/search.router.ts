import express, { Router } from 'express';
import { SearchController } from '../controllers/search.controller';

class SearchRoutes {
    private router: Router;
    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.post('/byKeyword', SearchController.prototype.searchByKeyword);
        return this.router;
    }
}

export const searchRoutes: SearchRoutes = new SearchRoutes();
