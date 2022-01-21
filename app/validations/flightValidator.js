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
      segments: [
        Joi.string(),
        Joi.array().items(Joi.string()),
      ],
    };

    super(body);
    this.query(query);
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
    };

    super(body);
    this.params(params);
    this.query(query);
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

module.exports = {
  searchOriginDestination: new SearchOriginDestination(),
  getPopularWaypoints: new GetPopularWaypoints(),
  searchFlights: new SearchFlights(),
  filterFlights: new FilterFlights(),
  getPopularFlights: new GetPopularFlights(),
  getCountries: new GetCountries(),
  getCities: new GetCities(),
  getAirports: new GetAirports(),
};
