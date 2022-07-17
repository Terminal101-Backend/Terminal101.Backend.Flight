const { Joi } = require("celebrate");

const { BaseValidator } = require("../core");

class SearchOriginDestination extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      waypointType: Joi.string().required(),
    };

    const query = {
      keyword: Joi.string(),
    };

    super(body);
    this.params(params);
    this.query(query);
  }
};

class GetPopularWaypoints extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      waypointType: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class SearchFlights extends BaseValidator {
  constructor() {
    const body = {
    };

    const query = {
      origin: Joi.string().required(),
      destination: Joi.string().required(),
      departureDate: Joi.date().required(),
      returnDate: Joi.date(),
      adults: Joi.number().default(1),
      children: Joi.number(),
      infants: Joi.number(),
      travelClass: Joi.string().default("ECONOMY"),
      segments: [
        Joi.string(),
        Joi.array().items(Joi.string()),
      ],
    };

    super(body);
    this.query(query);
  }
};

class GetFilters extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      searchId: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class FilterFlights extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      searchId: Joi.string().required(),
    };

    const query = {
      stops: [
        Joi.string(),
        Joi.array().items(Joi.number()),
      ],
      airports: [
        Joi.string(),
        Joi.array().items(Joi.string()),
      ],
      airlines: [
        Joi.string(),
        Joi.array().items(Joi.string()),
      ],
      priceFrom: Joi.number(),
      priceTo: Joi.number(),
      departureTimeFrom: Joi.number().default(0),
      departureTimeTo: Joi.number().default(23 * 60 + 59),
      arrivalTimeFrom: Joi.number().default(0),
      arrivalTimeTo: Joi.number().default(23 * 60 + 59),
      durationFrom: Joi.number(),
      durationTo: Joi.number(),
    };

    super(body);
    this.params(params);
    this.query(query);
  }
};

class GetFlightPrice extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      searchId: Joi.string().required(),
      flightCode: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class GetFlight extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      searchId: Joi.string().required(),
      flightCode: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class GetPopularFlights extends BaseValidator {
  constructor() {
    const body = {
    };

    super(body);
  }
};

class GetCountries extends BaseValidator {
  constructor() {
    const body = {
    };

    super(body);
  }
};

class GetCities extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      code: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class GetAirports extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      countryCode: Joi.string().required(),
      cityCode: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class GetAirlines extends BaseValidator {
  constructor() {
    const body = {
    };

    super(body);
  }
};

class RestrictionCovid19 extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      countryCode: Joi.string().required(),
      cityCode: Joi.string(),
    };

    super(body);
    this.params(params);
  }
};

class SearchOriginDestinationAmadeus extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      waypointType: Joi.string().required(),
    };

    const query = {
      keyword: Joi.string().allow(null, ''),
    };

    super(body);
    this.params(params);
    this.query(query);
  }
};

module.exports = {
  searchOriginDestination: new SearchOriginDestination(),
  getPopularWaypoints: new GetPopularWaypoints(),
  searchFlights: new SearchFlights(),
  getFilterLimit: new GetFilters(),
  filterFlights: new FilterFlights(),
  getFlightPrice: new GetFlightPrice(),
  getFlight: new GetFlight(),
  getPopularFlights: new GetPopularFlights(),
  getCountries: new GetCountries(),
  getCities: new GetCities(),
  getAirports: new GetAirports(),
  getAirlines: new GetAirlines(),
  restrictionCovid19: new RestrictionCovid19(),
  searchOriginDestinationAmadeus: new SearchOriginDestinationAmadeus(),
};
