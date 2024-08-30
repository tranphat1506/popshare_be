import Joi, { ObjectSchema } from 'joi';
import { CommonErrorMessageCode } from './signup';
const regularSigninSchema: ObjectSchema = Joi.object().keys({
    username: Joi.string()
        .required()
        .messages({
            'any.required': '{{#label}} ' + CommonErrorMessageCode.required,
            'string.base': '{{#label}} ' + CommonErrorMessageCode.base,
            'string.empty': '{{#label}} ' + CommonErrorMessageCode.empty,
        }),
    email: Joi.string()
        .required()
        .email()
        .messages({
            'any.required': '{{#label}} ' + CommonErrorMessageCode.required,
            'string.base': '{{#label}} ' + CommonErrorMessageCode.base,
            'string.email': '{{#label}} ' + CommonErrorMessageCode.email,
            'string.empty': '{{#label}} ' + CommonErrorMessageCode.empty,
        }),
    password: Joi.string()
        .required()
        .messages({
            'any.required': '{{#label}} ' + CommonErrorMessageCode.required,
            'string.base': '{{#label}} ' + CommonErrorMessageCode.base,
            'string.empty': '{{#label}} ' + CommonErrorMessageCode.empty,
        }),
});

export { regularSigninSchema };
