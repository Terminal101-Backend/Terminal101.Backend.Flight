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

class DeleteProvider extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      name: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class AddProvider extends BaseValidator {
  constructor() {
    const body = {
      name: Joi.string().required(),
      title: Joi.string().required(),
      isActive: Joi.boolean().default(true),
    };

    super(body);
  }
};

module.exports = {
  getProviders: new GetProviders(),
  editProvider: new EditProvider(),
  addProvider: new AddProvider(),
  deleteProvider: new DeleteProvider(),
};
