const { Joi } = require("celebrate");

const { BaseValidator } = require("../core");

class SearchOriginDestination extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      waypoint: Joi.string().required(),
    };

    const query = {
      keyword: Joi.string(),
    };

    super(body);
    this.params(params);
    this.query(query);
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
  getCountries: new GetCountries(),
  getCities: new GetCities(),
  getAirports: new GetAirports(),
};
