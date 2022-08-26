const { celebrate, Joi, errors } = require("celebrate")

class BaseValidator {
  #body = {};
  #query = {};
  #params = {};
  #cookies = {};
  #header = {
    // "content-type": Joi.any().required(),
  };

  constructor(body) {
    this.#body = body;
  }

  header(validation) {
    this.#header = validation;
  }

  query(validation) {
    this.#query = validation;
  }

  params(validation) {
    this.#params = validation;
  }

  cookies(validation) {
    this.#cookies = validation;
  }

  check(pagination = false, filter = false) {
    if (!!pagination) {
      this.#header.page = Joi.number().default(0);
      this.#header.pageSize = Joi.number().default(config.application.pagination.pageSize);
    }

    if (!!filter) {
      this.#query.sort = Joi.string().default("");
      this.#query.filter = Joi.object().default({});
    }

    return celebrate({
      body: Joi.object().keys(this.#body),
      cookies: Joi.object().keys(this.#cookies),
      query: Joi.object().keys(this.#query),
      params: Joi.object().keys(this.#params),
      headers: Joi.object().keys(this.#header).unknown()
    });
  }

  static get errors() {
    return errors();
  }
}

module.exports = BaseValidator;