const Joi = require("joi");
const { baseValidator } = require("../core");
const { EBookedFlightStatus, ECategory } = require("../constants");

module.exports.bookFlight = baseValidator({
  body: {
    searchedFlightCode: Joi.string().required(),
    flightDetailsCode: Joi.string().required(),
    paymentMethodName: Joi.string().required(),
    currencySource: Joi.string(),
    currencyTarget: Joi.string(),
    // payWay: Joi.string().pattern(/^WALLET|PAY$/).default("PAY"),
    useWallet: Joi.boolean().default(false),
    contact: Joi.object({
      email: Joi.string().required(),
      mobileNumber: Joi.string().required(),
    }).required(),
    passengers: Joi.array().items(Joi.object({
      documentCode: Joi.string().required(),
      documentIssuedAt: Joi.string().required(),
    })).min(1).required(),
  },
});

module.exports.bookFlightForUser = baseValidator({
  body: {},
  params: {
    userCode: Joi.string().required(),
  },
});

module.exports.editUserBookedFlight = baseValidator({
  body: {
    contact: Joi.object({
      email: Joi.string(),
      mobileNumber: Joi.string(),
    }),
    passengers: Joi.array().items(Joi.object({
      documentCode: Joi.string().required(),
      documentIssuedAt: Joi.string().required(),
    })).min(1).required(),
    // removePassengers: Joi.array().items(Joi.object({
    //   documentCode: Joi.string().required(),
    //   documentIssuedAt: Joi.string().required(),
    // })),
    status: EBookedFlightStatus.validator({ required: true }),
    description: Joi.string().default(""),
  },

  params: {
    userCode: Joi.string().required(),
    bookedFlightCode: Joi.string().required(),
  },
});

module.exports.getBookedFlights = baseValidator({
  body: {},
}, true);

module.exports.getUserBookedFlights = baseValidator({
  body: {},

  params: {
    userCode: Joi.string().required(),
  },
}, true);

module.exports.cancelBookedFlight = baseValidator({
  body: {
    description: Joi.string().required(),
    refundTo: Joi.string().regex(/WALLET|CREDIT_CARD|CRYPTO_CURRENCY/).default("WALLET"),
    refundInfo: Joi.string(),
  },
  params: {
    bookedFlightCode: Joi.string().required(),
  },
});

module.exports.generateNewPaymentInfo = baseValidator({
  body: {
    paymentMethodName: Joi.string().required(),
    // payWay: Joi.string().pattern(/^WALLET|PAY$/).default("PAY"),
    useWallet: Joi.boolean().default(false),
    currencySource: Joi.string(),
    currencyTarget: Joi.string(),
  },
  params: {
    bookedFlightCode: Joi.string().required(),
  },
});

module.exports.getBookedFlightStatuses = baseValidator({
  body: {},
  params: {
    bookedFlightCode: Joi.string().required(),
  },
}, true);

module.exports.getUserBookedFlightStatuses = baseValidator({
  body: {},
  params: {
    userCode: Joi.string().required(),
    bookedFlightCode: Joi.string().required(),
  },
}, true);

module.exports.getBookedFlight = baseValidator({
  body: {},
  params: {
    bookedFlightCode: Joi.string().required(),
  },
});

module.exports.getUserBookedFlight = baseValidator({
  body: {},
  params: {
    userCode: Joi.string().required(),
    bookedFlightCode: Joi.string().required(),
  },
});

module.exports.payForFlight = baseValidator({
  body: {
    userCode: Joi.string().required(),
    externalTransactionId: Joi.string().required(),
    confirmed: Joi.boolean().required(),
  },
});

module.exports.getBookedFlightsHistory = baseValidator({
  body: {},
}, true);

module.exports.getChartHistory = baseValidator({
  body: {},
  params: {
    category: ECategory.validator({ required: true }),
  },
}, true);