const {Joi} = require("celebrate");
const {baseValidator} = require("../core");
const {ETravelClass} = require("../constants");

module.exports.lowFareSearch = baseValidator({
  body: {},
  params: {
    // providerTitle: Joi.string().required(),
    0: Joi.string().allow(null, ""),
  },
  query: {
    originLocationCode: Joi.string().required(),
    destinationLocationCode: Joi.string().required(),
    departureDate: Joi.date().required(),
    returnDate: Joi.date(),
    segments: [
      Joi.array().items(Joi.string()).default([]),
      Joi.string(),
    ],
    adults: Joi.number().default(1),
    children: Joi.number().default(0),
    infants: Joi.number().default(0),
    travelClass: ETravelClass.validator({default: "ECONOMY"}),
    includedAirlineCodes: [
      Joi.array().items(Joi.string()).default([]),
      Joi.string(),
    ],
    excludedAirlineCodes: [
      Joi.array().items(Joi.string()).default([]),
      Joi.string(),
    ],
    nonStop: Joi.boolean().default(false),
    currency: Joi.string().default("USD"),
  },
});

module.exports.bookFlight = baseValidator({
  body: {
    segments: Joi.array().items(Joi.object().keys({
      flightNumber: Joi.string().required(),
      airlineCode: Joi.string().required().length(2),
      originCode: Joi.string().required().length(3),
      destinationCode: Joi.string().required().length(3),
      date: Joi.date().required(),
    })).min(1),
    contact: Joi.object().keys({
      email: Joi.string().email(),
      mobileNumber: Joi.string(),
    }),
    travelers: Joi.array().items(Joi.object().keys({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      birthDate: Joi.date().required(),
      type: Joi.string().required().regex(/ADT|CHD|INF/),
      genderCode: Joi.string().required().regex(/M|F/),
      document: Joi.object().keys({
        issuedAt: Joi.string().required().length(2),
        expirationDate: Joi.date().required(),
        code: Joi.string().required(),
      }),
    })).min(1),
    price: Joi.object().keys({
      base: Joi.number().required(),
      total: Joi.number().required(),
      currency: Joi.string().required().length(3)
    }).required(),
  },
  params: {
    // providerTitle: Joi.string().required(),
    0: Joi.string().allow(null, ""),
  },
});

module.exports.getBookedFlight = baseValidator({
  body: {},
  params: {
    // providerTitle: Joi.string().required(),
    bookedId: Joi.string().required(),
    0: Joi.string().allow(null, ""),
  },
});
