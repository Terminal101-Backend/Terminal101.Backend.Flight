const { Joi } = require("celebrate");

const { BaseValidator } = require("../core");

class LowFareSearch extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      providerName: Joi.string().required().regex(/AVTRA|AMADEUS|PARTO/),
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
};
