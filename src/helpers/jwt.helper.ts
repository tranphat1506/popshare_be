import JWT from 'jsonwebtoken';
import { NotAuthorizedError, ServerError } from './error-handler';
const verifyToken = async <P>(token: string, secret: string): Promise<P> => {
    try {
        return JWT.verify(token, secret) as any;
    } catch (error) {
        throw new NotAuthorizedError('Token is not available. Please login again.');
    }
};
const generateToken = (schema: any, secret: string, tokenLife: string | number | undefined): Promise<string> => {
    return new Promise((resolve, reject) => {
        JWT.sign(
            schema,
            secret,
            {
                expiresIn: tokenLife,
                algorithm: 'HS256',
            },
            (error, encoded) => {
                if (error) {
                    throw new ServerError('Server cannot sign token right now.');
                } else resolve(encoded!);
            },
        );
    });
};
const getPayload = (token: string) => {
    return JWT.decode(token, { json: true });
};
export { verifyToken, generateToken, getPayload };
