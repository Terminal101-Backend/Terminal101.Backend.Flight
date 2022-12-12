const Joi = require("joi");
const {baseValidator} = require("../core");

module.exports.getProviders = baseValidator({
  body: {},
});

module.exports.editProvider = baseValidator({
  body: {
    title: Joi.string(),
    isActive: Joi.boolean(),
  },
  params: {
    name: Joi.string().required(),
  },
});

module.exports.deleteProvider = baseValidator({
  body: {},
  params: {
    name: Joi.string().required(),
  },
});

module.exports.addProvider = baseValidator({
  body: {
    name: Joi.string().required(),
    title: Joi.string().required(),
    isActive: Joi.boolean().default(true),
  },
});
