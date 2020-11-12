const Joi = require('@hapi/joi');

//joi validation for signup
const registerValidation = data =>{
    const schema = {
        username: Joi.string()
                .min(6)
                .required(),
        email: Joi.string()
                .min(6)
                .required()
                .email(),
        password: Joi.string()
                .min(8)
                .required()
    };
    return Joi.validate(data,schema);
};

//joi validation for sign in
const loginValidation = data =>{
        const schema = {
            email: Joi.string()
                .min(6)
                .required()
                .email(),
            password: Joi.string()
                .min(8)
                .required()
        };
        return Joi.validate(data,schema);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;