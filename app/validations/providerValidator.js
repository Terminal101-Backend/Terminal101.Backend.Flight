const { Joi } = require("celebrate");

const { BaseValidator } = require("../core");

class GetProviders extends BaseValidator {
  constructor() {
    const body = {
    };

    super(body);
  }
};

class EditProvider extends BaseValidator {
  constructor() {
    const body = {
      title: Joi.string(),
      isActive: Joi.boolean(),
    };

    const params = {
      name: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

module.exports = {
  getProviders: new GetProviders(),
  editProvider: new EditProvider(),
};
