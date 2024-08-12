import { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';
import cookieSession from 'cookie-session';
import { config } from '@root/config';
import { Logger } from 'winston';
import HTTP_STATUS from 'http-status-codes';
import http from 'http';
import initRoutes from '@root/initRoutes';
const SPEAKER = 'server';
const SERVER_PORT = config.SERVER_PORT;
const log: Logger = config.createLogger(SPEAKER);
export class PopShareServer {
    private app: Application;

    constructor(app: Application) {
        this.app = app;
    }
    public start(): void {
        this.securityMiddlewares(this.app);
        this.standardMiddlewares(this.app);
        this.routesMiddleware(this.app);
        this.globalErrorHandler(this.app);
        this.startServer(this.app);
    }

    private securityMiddlewares(app: Application) {
        app.set('trust proxy', 1);
        app.use(
            cookieSession({
                name: 'session',
                keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
                maxAge: 24 * 7 * 3600000,
                secure: config.NODE_ENV !== 'development',
                sameSite: 'none', // comment this line when running the server locally
            }),
        );
        app.use(helmet());
        app.use(hpp());
        app.use(
            cors({
                origin: config.CLIENT_URL,
                credentials: true,
                optionsSuccessStatus: 200,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            }),
        );
    }

    private standardMiddlewares(app: Application): void {
        app.use(compression());
        app.use(json({ limit: '50mb' }));
        app.use(urlencoded({ extended: true, limit: '50mb' }));
    }

    private routesMiddleware(app: Application): void {
        initRoutes(app);
    }

    private globalErrorHandler(app: Application): void {
        app.all('*', (req: Request, res: Response) => {
            res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
        });

        app.use((error: Error, _req: Request, res: Response, next: NextFunction) => {
            log.error(error);
            next();
        });
    }

    private async startServer(app: Application): Promise<void> {
        try {
            const httpServer: http.Server = new http.Server(app);
            this.startHttpServer(httpServer);
        } catch (error) {
            log.error(error);
        }
    }

    private startHttpServer(httpServer: http.Server): void {
        log.info(`Worker with process id of ${process.pid} has started...`);
        log.info(`Server has started with process ${process.pid}`);
        httpServer.listen(SERVER_PORT, () => {
            log.info(`Server running on port ${SERVER_PORT}`);
        });
    }
}
