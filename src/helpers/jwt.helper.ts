import JWT, { JwtPayload } from 'jsonwebtoken';
import { NotAuthorizedError, ServerError } from './error-handler';
import { AuthPayload } from '@root/features/auth/interfaces/auth.interfaces';
const verifyToken = async (token: string, secret: string): Promise<AuthPayload> => {
    try {
        return JWT.verify(token, secret) as AuthPayload;
    } catch (error) {
        throw new NotAuthorizedError('Token is not available. Please login again.');
    }
};
const generateToken = (schema: any, secret: string, tokenLife: string): Promise<string> => {
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
