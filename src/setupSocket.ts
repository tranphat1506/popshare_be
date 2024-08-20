import http from 'http';
import { Server } from 'socket.io';
import { config, LoggerBase } from './config';
import { Redis } from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { NotificationSocket } from './services/sockets/notification.socket';
import { UserSocket } from './services/sockets/user.socket';
import { RoomSocket } from './services/sockets/room.socket';

export class SocketIOServer extends LoggerBase {
    private io: Server | null = null;

    constructor() {
        super('SocketIOServer');
    }
    public async init(httpServer: http.Server) {
        this.io = new Server(httpServer, {
            cors: {
                origin: config.CLIENT_URL,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            },
        });
        const pubClient = _redisClient;
        const subClient = pubClient.duplicate();
        await Promise.all([pubClient, subClient]);
        this.io.adapter(createAdapter(pubClient, subClient));
        this.socketIOConnections(this.io);
        this.log.info('Successfully init socketIO server');
    }

    public socketIOConnections(io: Server): void {
        new NotificationSocket(io).listen();
        new UserSocket(io).listen();
        new RoomSocket(io).listen();
    }
}
