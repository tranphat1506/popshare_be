import HTTP_STATUS from 'http-status-codes';

export interface IErrorResponse {
    message: string;
    statusCode: number;
    status: string;
    serializeErrors(): IError;
}

export interface IError {
    message: string;
    statusCode?: number;
    status?: string;
    payload?: any;
    event?: string;
}

export abstract class CustomError extends Error {
    abstract statusCode: number;
    abstract status: string;

    constructor(message: string) {
        super(message);
    }

    serializeErrors(): IError {
        return {
            message: this.message,
            status: this.status,
            statusCode: this.statusCode,
        };
    }
}

export class JoiRequestValidationError extends CustomError {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}

export class BadRequestError extends CustomError {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}

export class NotFoundError extends CustomError {
    statusCode = HTTP_STATUS.NOT_FOUND;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}

export class NotAuthorizedError extends CustomError {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}

export class NotAcceptableError extends CustomError {
    statusCode = HTTP_STATUS.NOT_ACCEPTABLE;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}

export class SocketEventError extends Error {
    public event: string;
    public payload: any;

    constructor(event: string, message: string, payload: any) {
        super(message);
        this.event = event;
        this.payload = payload;
    }

    serializeErrors(): IError {
        return {
            message: this.message,
            payload: this.payload,
            event: this.event,
        };
    }
}

export class FileTooLargeError extends CustomError {
    statusCode = HTTP_STATUS.REQUEST_TOO_LONG;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}

export class ServerError extends CustomError {
    statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}
