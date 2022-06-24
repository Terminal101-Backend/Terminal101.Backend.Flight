const { Joi } = require("celebrate");

const { BaseValidator } = require("../core");

class GetFlightConditions extends BaseValidator {
  constructor() {
    const body = {
    };

    super(body);
  }
};

class GetFlightCondition extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      code: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class EditFlightCondition extends BaseValidator {
  constructor() {
    const body = {
      origin: Joi.object().keys({
        items: Joi.array().items(Joi.string()).required(),
        exclude: Joi.bool().default(false),
      }).default({ items: [], exclude: false }),
      destination: Joi.object().keys({
        items: Joi.array().items(Joi.string()).required(),
        exclude: Joi.bool().default(false),
      }).default({ items: [], exclude: false }),
      airline: Joi.object().keys({
        items: Joi.array().items(Joi.string()).required(),
        exclude: Joi.bool().default(false),
      }).default({ items: [], exclude: false }),
      providerNames: Joi.array().items(Joi.string()),
      isRestricted: Joi.boolean(),
    };

    const params = {
      code: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class DeleteFlightCondition extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      code: Joi.number().required(),
    };

    super(body);
    this.params(params);
  }
};

class AddFlightCondition extends BaseValidator {
  constructor() {
    const body = {
      origin: Joi.object().keys({
        items: Joi.array().items(Joi.string()).required(),
        exclude: Joi.bool().default(false),
      }).default({ items: [], exclude: false }),
      destination: Joi.object().keys({
        items: Joi.array().items(Joi.string()).required(),
        exclude: Joi.bool().default(false),
      }).default({ items: [], exclude: false }),
      airline: Joi.object().keys({
        items: Joi.array().items(Joi.string()).required(),
        exclude: Joi.bool().default(false),
      }).default({ items: [], exclude: false }),
      providerNames: Joi.array().items(Joi.string()).default([]),
      isRestricted: Joi.boolean().default(false),
    };

    super(body);
  }
};

module.exports = {
  getFlightConditions: new GetFlightConditions(),
  getFlightCondition: new GetFlightCondition(),
  editFlightCondition: new EditFlightCondition(),
  addFlightCondition: new AddFlightCondition(),
  deleteFlightCondition: new DeleteFlightCondition(),
};
