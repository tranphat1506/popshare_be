import Joi, { ObjectSchema } from 'joi';
const MIN_LENGTH_DEFAULT = 4;
const MAX_LENGTH_DEFAULT = 32;
const MAX_LENGTH_USERNAME = 16;
const MAX_LENGTH_DISPLAY_NAME = MAX_LENGTH_DEFAULT;
const regularSignupSchema: ObjectSchema = Joi.object().keys({
    username: Joi.string().required().min(MIN_LENGTH_DEFAULT).max(MAX_LENGTH_USERNAME).messages({
        'string.base': 'Username must be of type string',
        'string.min': 'Invalid username',
        'string.max': 'Invalid username',
        'string.empty': 'Username is a required field',
    }),
    displayName: Joi.string().required().min(MIN_LENGTH_DEFAULT).max(MAX_LENGTH_DISPLAY_NAME).messages({
        'string.base': 'Display name must be of type string',
        'string.min': 'Invalid display name',
        'string.max': 'Invalid display name',
        'string.empty': 'Display name is a required field',
    }),
    password: Joi.string().required().min(MIN_LENGTH_DEFAULT).max(MAX_LENGTH_DEFAULT).messages({
        'string.base': 'Password must be of type string',
        'string.min': 'Invalid password',
        'string.max': 'Invalid password',
        'string.empty': 'Password is a required field',
    }),
    email: Joi.string().required().email().messages({
        'string.base': 'Email must be of type string',
        'string.email': 'Email must be valid',
        'string.empty': 'Email is a required field',
    }),
    avatarColor: Joi.string().required().messages({
        'any.required': 'Avatar color is required',
    }),
    avatarEmoji: Joi.string().required().messages({
        'any.required': 'Avatar emoji is required',
    }),
});

export { regularSignupSchema };
