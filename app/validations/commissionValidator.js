const Joi = require("joi");
const { baseValidator } = require("../core");

module.exports.getCommissions = baseValidator({
  body: {},
}, true, true);

module.exports.getCommission = baseValidator({
  body: {},
  params: {
    code: Joi.number().required(),
  },
});

module.exports.editCommission = baseValidator({
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
    isActive: Joi.boolean(),
  },
  params: {
    code: Joi.string().required(),
  },
});

module.exports.deleteCommission = baseValidator({
  body: {},
  params: {
    code: Joi.number().required(),
  },
});

module.exports.addCommission = baseValidator({
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
  },
});
