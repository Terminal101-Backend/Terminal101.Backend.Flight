const Joi = require("joi");
const {baseValidator} = require("../core");

module.exports.getFlightTickets = baseValidator({
  body: {},
  params: {
    bookedFlightCode: Joi.string().required(),
  },
});

module.exports.getFlightTicketsView = baseValidator({
  body: {},
  params: {
    token: Joi.string().required(),
    bookedFlightCode: Joi.string().required(),
  },
});

module.exports.getUserFlightTickets = baseValidator({
  body: {},
  params: {
    userCode: Joi.string().required(),
    bookedFlightCode: Joi.string().required(),
  },
});
