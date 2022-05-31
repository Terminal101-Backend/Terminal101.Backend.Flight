const { ValidationException } = require("./validationExceptionHelper");
const { common } = require("../services");

//making response for successfully situation
exports.success = async (data, language) => {
  try {
    return await common.translate({
      status: true,
      message: "",
      data,
    }, language);
  } catch (e) {
    return {
      status: true,
      message: "",
      data,
    };
  }
};

//making response for error by status code (default is 404)
exports.error = async (message, language, data = {}) => {
  try {
    return await common.translate({
      status: false,
      message: `{{${message}}}`,
      data,
    }, language);
  } catch (e) {
    return {
      status: false,
      message,
      data,
    };
  }
};

// convert Exception error to user error response
exports.exception = async (error, language, extraData) => {
  let data = [];
  let message = error.message ?? error;
  if (error instanceof ValidationException) {
    data = error.data
    message = error.message
  }

  try {
    return await common.translate({
      status: false,
      message: `{{${message}}}`,
      data: {
        ...data,
        ...extraData,
      },
    }, language);
  } catch (e) {
    return {
      status: false,
      message,
      data: {
        ...data,
        ...extraData,
      },
    };
  }
};
