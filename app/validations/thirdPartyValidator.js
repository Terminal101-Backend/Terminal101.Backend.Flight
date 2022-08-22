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

class Book extends BaseValidator {
  constructor() {
    const body = {
      segments: Joi.array().items(Joi.object().keys({
        origin: Joi.string().required(),
        destination: Joi.string().required(),
        date: Joi.date().required(),
      })).min(1),
      travelers: Joi.array().items(Joi.object().keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        birthDate: Joi.date().required(),
        document: Joi.object().keys({
          issuedAt: Joi.string().required(),
          expireDate: Joi.date().required(),
          code: Joi.string().required(),
        }),
      })).min(1),
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

module.exports = {
  lowFareSearch: new LowFareSearch(),
  book: new Book(),
};
