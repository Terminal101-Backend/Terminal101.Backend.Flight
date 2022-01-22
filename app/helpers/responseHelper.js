const { ValidationException } = require("./validationExceptionHelper");

//making response for successfully situation
exports.success = (res, data) => {
    return res.status(200).send({
        status: true,
        message: "",
        data: data
    });
};

//making response for error by status code (default is 404)
exports.error = function (res, message, statusCode = 404, data = []) {
    console.error(message);
    return res.status(statusCode).json(
        {
            status: false,
            message: message,
            // type: "error",
            data: data
        }
    );
};

// convert Exception error to user error response
exports.exception = function (res, error) {
    let data = (!!error.data ? error.data : (!!error.response ? !!error.response.data ? error.response.data : error.response : error));
    let message = error.message;
    console.error(data);
    console.log(message);
    // if (error instanceof ValidationException) {
    //     data = error.data
    //     message = error.message
    // }
    // console.log(error)
    return res.status(500).send({
        status: false,
        message: message,
        data: data
    });
};
