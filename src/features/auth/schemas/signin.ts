import Joi, { ObjectSchema } from 'joi';
import { CommonErrorMessageCode } from './signup';
const regularSignInSchema: ObjectSchema = Joi.object().keys({
    account: Joi.string().messages({
        'string.base': '{{#label}} ' + CommonErrorMessageCode.base,
        'string.empty': '{{#label}} ' + CommonErrorMessageCode.empty,
    }),
    username: Joi.string().messages({
        'string.base': '{{#label}} ' + CommonErrorMessageCode.base,
        'string.empty': '{{#label}} ' + CommonErrorMessageCode.empty,
    }),
    email: Joi.string()
        .email()
        .messages({
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
    rememberDevice: Joi.boolean().messages({
        'string.base': '{{#label}} ' + CommonErrorMessageCode.base,
    }),
    otpToken: Joi.string().messages({
        'string.base': '{{#label}} ' + CommonErrorMessageCode.base,
    }),
});

export { regularSignInSchema };
