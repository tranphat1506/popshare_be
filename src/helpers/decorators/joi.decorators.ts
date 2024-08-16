/* eslint-disable @typescript-eslint/no-explicit-any */
import { JoiRequestValidationError } from '../error-handler';
import { NextFunction, Request } from 'express';
import { ObjectSchema } from 'joi';

type IJoiDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void;

export function joiValidation(schema: ObjectSchema): IJoiDecorator {
    return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const req: Request = args[0];
            const next: NextFunction = args[2];
            try {
                const { error } = await Promise.resolve(schema.validate(req.body));
                if (error?.details) {
                    throw new JoiRequestValidationError(error.details[0].message);
                }
                return originalMethod.apply(this, args);
            } catch (error) {
                next(error);
            }
        };
        return descriptor;
    };
}
