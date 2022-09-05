const Joi = require("joi");
const response = require("../helpers/responseHelper");

module.exports = ({query = {}, body = {}, params = {}, headers = {}}, pagination = false, filter = undefined) => {
  headers.language = Joi.string().default("EN");
  if (!!pagination) {
    headers.page = Joi.number().default(0);
    headers.pageSize = Joi.number().default(25);
  }

  if (!!filter || (!!pagination && (filter === undefined))) {
    query.sort = Joi.string().default("");
    query.filter = Joi.object().default({});
  }

  return {
    get query() {
      return query;
    },

    get body() {
      return body;
    },

    get params() {
      return params;
    },

    get headers() {
      return headers;
    },

    check(req, res, next) {
      try {
        let hasError = false;
        const errors = {};

        const queryValidation = Joi.object().default({}).keys(query).validate(req.query);
        if (!!queryValidation.error) {
          hasError = true;
          errors.query = queryValidation.error.details.map(e => e.message);
        }

        const bodyValidation = Joi.object().default({}).keys(body).validate(req.body);
        if (!!bodyValidation.error) {
          hasError = true;
          errors.body = bodyValidation.error.details.map(e => e.message);
        }

        const paramsValidation = Joi.object().default({}).keys(params).validate(req.params);
        if (!!paramsValidation.error) {
          hasError = true;
          errors.params = paramsValidation.error.details.map(e => e.message);
        }

        const headersValidation = Joi.object().default({}).keys(headers).unknown(true).validate(req.headers);
        if (!!headersValidation.error) {
          hasError = true;
          errors.headers = headersValidation.error.details.map(e => e.message);
        }

        if (!!hasError) {
          throw errors;
        } else {
          next();
        }
      } catch (e) {
        response.error(res, "validation_failed", 400, e);
      }
    }
  };
};
