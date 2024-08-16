import { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';
import { config, LoggerBase } from '@root/config';
import HTTP_STATUS from 'http-status-codes';
import http from 'http';
import initRoutes from '@root/initRoutes';
import { CustomError, IErrorResponse, ServerError } from './helpers/error-handler';
import useragent from 'express-useragent';
import { SocketIOServer } from './setupSocket';
const SERVER_PORT = config.SERVER_PORT;
export class PopShareServer extends LoggerBase {
    private app: Application;

    constructor(app: Application) {
        super('Server');
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
        app.use(useragent.express());
    }

    private routesMiddleware(app: Application): void {
        initRoutes(app);
    }

    private globalErrorHandler(app: Application): void {
        app.all('*', (req: Request, res: Response) => {
            res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
        });
        app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
            if (error instanceof CustomError) {
                if (error instanceof ServerError) this.log.error(error);
                return res.status(error.statusCode).json(error.serializeErrors());
            }
            this.log.error(error);
            next(error);
        });
    }

    private async startServer(app: Application): Promise<void> {
        try {
            const httpServer: http.Server = new http.Server(app);
            const socketServer = new SocketIOServer();
            await socketServer.init(httpServer);
            this.startHttpServer(httpServer);
        } catch (error) {
            this.log.error(error);
        }
    }

    private startHttpServer(httpServer: http.Server): void {
        this.log.info(`Worker with process id of ${process.pid} has started...`);
        this.log.info(`Server has started with process ${process.pid}`);
        httpServer.listen(SERVER_PORT, () => {
            this.log.info(`Server running on port ${SERVER_PORT}`);
        });
    }
}
