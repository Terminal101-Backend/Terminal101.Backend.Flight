const { ValidationException } = require("./validationExceptionHelper");
const { common } = require("../services");

//making response for successfully situation
exports.success = (res, data) => {
    //console.log(data);
    res.status(200).send({
        status: true,
        message: "",
        // data: await common.translate(data, language),
        data
    });
};

//making response for error by status code (default is 404)
exports.error = (res, message, statusCode = 404, data = []) => {
    console.error(`Code: ${statusCode}, Message: ${message}`);
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
    if (message === `Passenger's passport number is not valid.`) {
        console.error(`Code: 400, Message: ${message}`);
        return res.status(404).send({
            status: false,
            message: 'passport_not_valid',
            data,
        });
    }
    if (message === 'ReValidation failed') {
        console.error(`Code: 404, Message: ${message}`);
        return res.status(404).send({
            status: false,
            message: 'flight_not_available',
            data,
        });
    }
    console.error(`Code: 500, Message: ${message}`);
    return res.status(500).send({
        status: false,
        message: `{{${message}}}`,
        data,
    });
};
