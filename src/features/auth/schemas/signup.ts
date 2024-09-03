import Joi, { ObjectSchema } from 'joi';
const MIN_LENGTH_DEFAULT = 4;
const MAX_LENGTH_DEFAULT = 32;
const MAX_LENGTH_USERNAME = 24;
const MAX_LENGTH_DISPLAY_NAME = MAX_LENGTH_DEFAULT;
const Regex = {
    email: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    password: /^(?=.*[\d])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*-_]).{0,}$/,
    username: /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,}$/,
};
export const CommonErrorMessageCode = {
    required: 'ERROR_REQUIRED',
    base: 'ERROR_DIFF_TYPE',
    min: 'ERROR_UNDER_MIN {{#limit}}',
    max: 'ERROR_OVER_MAX {{#limit}}',
    empty: 'ERROR_EMPTY',
    email: 'ERROR_INVALID_EMAIL',
    pattern: 'ERROR_INVALID_PATTERN',
};
const regularSignupSchema: ObjectSchema = Joi.object().keys({
    displayName: Joi.string()
        .trim()
        .required()
        .min(MIN_LENGTH_DEFAULT)
        .max(MAX_LENGTH_DISPLAY_NAME)
        .messages({
            'any.required': '{{#label}} ' + CommonErrorMessageCode.required,
            'string.base': '{{#label}} ' + CommonErrorMessageCode.base,
            'string.min': '{{#label}} ' + CommonErrorMessageCode.min,
            'string.max': '{{#label}} ' + CommonErrorMessageCode.max,
            'string.empty': '{{#label}} ' + CommonErrorMessageCode.empty,
        }),
    username: Joi.string()
        .trim()
        .pattern(Regex.username)
        .required()
        .min(MIN_LENGTH_DEFAULT)
        .max(MAX_LENGTH_USERNAME)
        .messages({
            'string.pattern.base': '{{#label}} ' + CommonErrorMessageCode.pattern,
            'any.required': '{{#label}} ' + CommonErrorMessageCode.required,
            'string.base': '{{#label}} ' + CommonErrorMessageCode.base,
            'string.min': '{{#label}} ' + CommonErrorMessageCode.min,
            'string.max': '{{#label}} ' + CommonErrorMessageCode.max,
            'string.empty': '{{#label}} ' + CommonErrorMessageCode.empty,
        }),
    email: Joi.string()
        .trim()
        .required()
        .pattern(Regex.email)
        .messages({
            'string.pattern.base': '{{#label}} ' + CommonErrorMessageCode.pattern,
            'any.required': '{{#label}} ' + CommonErrorMessageCode.required,
            'string.base': '{{#label}} ' + CommonErrorMessageCode.base,
            'string.email': '{{#label}} ' + CommonErrorMessageCode.email,
            'string.empty': '{{#label}} ' + CommonErrorMessageCode.empty,
        }),
    password: Joi.string()
        .trim()
        .pattern(Regex.password)
        .required()
        .min(MIN_LENGTH_DEFAULT)
        .max(MAX_LENGTH_DEFAULT)
        .messages({
            'string.pattern.base': '{{#label}} ' + CommonErrorMessageCode.pattern,
            'any.required': '{{#label}} ' + CommonErrorMessageCode.required,
            'string.base': '{{#label}} ' + CommonErrorMessageCode.base,
            'string.min': '{{#label}} ' + CommonErrorMessageCode.min,
            'string.max': '{{#label}} ' + CommonErrorMessageCode.max,
            'string.empty': '{{#label}} ' + CommonErrorMessageCode.empty,
        }),
    avatarColor: Joi.string()
        .trim()
        .required()
        .messages({
            'any.required': '{{#label}} ' + CommonErrorMessageCode.required,
        }),
    avatarEmoji: Joi.string()
        .trim()
        .required()
        .messages({
            'any.required': '{{#label}} ' + CommonErrorMessageCode.required,
        }),
});

export { regularSignupSchema };
