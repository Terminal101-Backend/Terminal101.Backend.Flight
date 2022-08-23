const { Joi } = require("celebrate");

const { BaseValidator } = require("../core");

class LowFareSearch extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      providerTitle: Joi.string().required(),
      0: Joi.string().allow(null, ""),
    };

    const query = {
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
      travelClass: Joi.string().regex(/ECONOMY|PREMIUM_ECONOMY|BUSINESS|FIRST/).default("ECONOMY"),
      includedAirlineCodes: [
        Joi.array().items(Joi.string()).default([]),
        Joi.string(),
      ],
      excludedAirlineCodes: [
        Joi.array().items(Joi.string()).default([]),
        Joi.string(),
      ],
      nonStop: Joi.boolean().default(false),
      currencyCode: Joi.string().default("USD"),
    };

    super(body);
    this.params(params);
    this.query(query);
  }
};

class BookFlight extends BaseValidator {
  constructor() {
    const body = {
      segments: Joi.array().items(Joi.object().keys({
        flightNumber: Joi.string().required(),
        airlineCode: Joi.string().required().length(2),
        originCode: Joi.string().required().length(3),
        destinationCode: Joi.string().required().length(3),
        date: Joi.date().required(),
      })).min(1),
      travelers: Joi.array().items(Joi.object().keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        birthDate: Joi.date().required(),
        nationality: Joi.string().required().length(2),
        type: Joi.string().required().regex(/ADT|CHD|INF/),
        genderCode: Joi.string().required().regex(/M|F/),
        document: Joi.object().keys({
          issuedAt: Joi.string().required().length(2),
          expireDate: Joi.date().required(),
          code: Joi.string().required(),
        }),
      })).min(1),
      price: Joi.object().keys({
        base: Joi.number().required(),
        total: Joi.number().required(),
        currencyCode: Joi.string().required().length(3)
      }).required(),
    };

    const params = {
      providerTitle: Joi.string().required(),
      0: Joi.string().allow(null, ""),
    };

    super(body);
    this.params(params);
  }
};

class GetBookedFlight extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      providerTitle: Joi.string().required(),
      bookedId: Joi.string().required(),
      0: Joi.string().allow(null, ""),
    };

    super(body);
    this.params(params);
  }
};

module.exports = {
  lowFareSearch: new LowFareSearch(),
  bookFlight: new BookFlight(),
  getBookedFlight: new GetBookedFlight(),
};
