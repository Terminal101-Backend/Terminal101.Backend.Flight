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
      exclude: Joi.bool(),
    }),
    destination: Joi.object().keys({
      items: Joi.array().items(Joi.string()).required(),
      exclude: Joi.bool(),
    }),
    airline: Joi.object().keys({
      items: Joi.array().items(Joi.string()).required(),
      exclude: Joi.bool(),
    }),
    business: Joi.object().keys({
      items: Joi.array().items(Joi.string()).required(),
      exclude: Joi.bool(),
    }),
    value: Joi.object().keys({
      percent: Joi.number(),
      constant: Joi.number(),
    }),
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
    business: Joi.object().keys({
      items: Joi.array().items(Joi.string()).required(),
      exclude: Joi.bool().default(false),
    }).default({ items: [], exclude: false }),
    value: Joi.object().keys({
      percent: Joi.number().default(0),
      constant: Joi.number().default(0),
    }).default({ percent: 0, constant: 0 }),
    providerNames: Joi.array().items(Joi.string()).default([]),
  },
});
