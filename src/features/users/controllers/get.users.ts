import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class GetUserController {
    public async all(req: Request, res: Response): Promise<void> {
        res.status(HTTP_STATUS.OK).json({
            message: 'Get Method',
        });
    }
}
