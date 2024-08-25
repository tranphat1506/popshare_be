import { roomService } from '@root/services/db/room.services';
import { NextFunction, Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class RoomController {
    public async getAllChatRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.currentUser!;
            const rooms = await roomService.getAllRoomByMemberId(`${userId}`);
            return res.status(HTTP_STATUS.OK).json({
                message: 'Success get chat rooms',
                roomIdList: rooms.map((r) => `${r._id}`),
                rooms: rooms,
            });
        } catch (error) {
            next(error);
        }
    }
}
