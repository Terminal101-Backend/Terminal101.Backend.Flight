const { ValidationException } = require("./validationExceptionHelper");
const { common } = require("../services");

//making response for successfully situation
exports.success = (res, data) => {
    res.status(200).send({
        status: true,
        message: "",
        // data: await common.translate(data, language),
        data
    });
};

//making response for error by status code (default is 404)
exports.error = (res, message, statusCode = 404, data = []) => {
    return res.status(statusCode).send(
        {
            status: false,
            message: `{{${message}}}`,
            // type: "error",
            data,
        }
    );
};

// convert Exception error to user error response
exports.exception = (res, error) => {
    let data = [];
    let message = error.message ?? error;
    if (error instanceof ValidationException) {
        data = error.data
        message = error.message
    }

    return res.status(500).send({
        status: false,
        message: `{{${message}}}`,
        data,
    });
};
