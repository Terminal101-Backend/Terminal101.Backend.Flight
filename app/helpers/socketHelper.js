const { ValidationException } = require("./validationExceptionHelper");
const { common } = require("../services");

//making response for successfully situation
exports.success = async (data, language) => {
    return await common.translate({
        status: true,
        message: "",
        data,
    }, language);
};

//making response for error by status code (default is 404)
exports.error = async (message, language, data = {}) => {
    return await common.translate({
        status: false,
        message: `{{${message}}}`,
        data,
    }, language);
};

// convert Exception error to user error response
exports.exception = async (error, language, extraData) => {
    let data = [];
    let message = error.message;
    if (error instanceof ValidationException) {
        data = error.data
        message = error.message
    }

    return await common.translate({
        status: false,
        message: `{{${message}}}`,
        data: {
            ...data,
            ...extraData,
        },
    }, language);
};
