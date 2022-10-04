const Joi = require("joi");
const { baseValidator } = require("../core");

module.exports.getFlightConditions = baseValidator({
  body: {},
}, true, true);

module.exports.getFlightCondition = baseValidator({
  body: {},
  params: {
    code: Joi.number().required(),
  },
});

module.exports.editFlightCondition = baseValidator({
  body: {
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
    isActive: Joi.boolean(),
  },
  params: {
    code: Joi.string().required(),
  },
});

module.exports.deleteFlightCondition = baseValidator({
  body: {},
  params: {
    code: Joi.number().required(),
  },
});

module.exports.addFlightCondition = baseValidator({
  body: {
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
  },
});
