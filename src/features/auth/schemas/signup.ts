import Joi, { ObjectSchema } from 'joi';
const MIN_LENGTH_DEFAULT = 4;
const MAX_LENGTH_DEFAULT = 32;
const MAX_LENGTH_USERNAME = 16;
const MAX_LENGTH_DISPLAY_NAME = MAX_LENGTH_DEFAULT;
enum CommonErrorMessageCode {
    required = 'ERROR_REQUIRED',
    base = 'ERROR_DIFF_TYPE',
    min = 'ERROR_MIN {{#limit}}',
    max = 'ERROR_MAX {{#limit}}',
    empty = 'ERROR_EMPTY',
    email = 'ERROR_INVALID_EMAIL',
}
const regularSignupSchema: ObjectSchema = Joi.object().keys({
    displayName: Joi.string()
        .required()
        .min(MIN_LENGTH_DEFAULT)
        .max(MAX_LENGTH_DISPLAY_NAME)
        .messages({
            'any.required': '{{#label}}' + CommonErrorMessageCode.required,
            'string.base': '{{#label}}' + CommonErrorMessageCode.base,
            'string.min': '{{#label}}' + CommonErrorMessageCode.min,
            'string.max': '{{#label}}' + CommonErrorMessageCode.max,
            'string.empty': '{{#label}}' + CommonErrorMessageCode.empty,
        }),
    username: Joi.string()
        .required()
        .min(MIN_LENGTH_DEFAULT)
        .max(MAX_LENGTH_USERNAME)
        .messages({
            'any.required': '{{#label}}' + CommonErrorMessageCode.required,
            'string.base': '{{#label}}' + CommonErrorMessageCode.base,
            'string.min': '{{#label}}' + CommonErrorMessageCode.min,
            'string.max': '{{#label}}' + CommonErrorMessageCode.max,
            'string.empty': '{{#label}}' + CommonErrorMessageCode.empty,
        }),
    email: Joi.string()
        .required()
        .email()
        .messages({
            'any.required': '{{#label}}' + CommonErrorMessageCode.required,
            'string.base': '{{#label}}' + CommonErrorMessageCode.base,
            'string.email': '{{#label}}' + CommonErrorMessageCode.email,
            'string.empty': '{{#label}}' + CommonErrorMessageCode.empty,
        }),
    password: Joi.string()
        .required()
        .min(MIN_LENGTH_DEFAULT)
        .max(MAX_LENGTH_DEFAULT)
        .messages({
            'any.required': '{{#label}}' + CommonErrorMessageCode.required,
            'string.base': '{{#label}}' + CommonErrorMessageCode.base,
            'string.min': '{{#label}}' + CommonErrorMessageCode.min,
            'string.max': '{{#label}}' + CommonErrorMessageCode.max,
            'string.empty': '{{#label}}' + CommonErrorMessageCode.empty,
        }),
    avatarColor: Joi.string()
        .required()
        .messages({
            'any.required': '{{#label}}' + CommonErrorMessageCode.required,
        }),
    avatarEmoji: Joi.string()
        .required()
        .messages({
            'any.required': '{{#label}}' + CommonErrorMessageCode.required,
        }),
});

export { regularSignupSchema };
