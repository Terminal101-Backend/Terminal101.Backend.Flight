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

  check() {
    return celebrate({ body: Joi.object().keys(this.#body), cookies: this.#cookies, query: this.#query, params: this.#params, headers: Joi.object().keys(this.#header).unknown() });
  }

  static errors() {
    return errors();
  }
}

module.exports = BaseValidator;