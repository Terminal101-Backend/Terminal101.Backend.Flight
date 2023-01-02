const Joi = require("joi");
const {baseValidator} = require("../core");
const {EFlightWaypoint, ETravelClass} = require("../constants");

module.exports.searchOriginDestination = baseValidator({
  body: {},
  params: {
    waypointType: EFlightWaypoint.validator({required: true}),
  },
  query: {
    keyword: Joi.string().allow(""),
  },
});

module.exports.getPopularWaypoints = baseValidator({
  body: {},
  params: {
    waypointType: EFlightWaypoint.validator({required: true}),
  },
});

module.exports.searchFlights = baseValidator({
  body: {},
  query: {
    origin: Joi.string().required(),
    destination: Joi.string().required(),
    departureDate: Joi.date().required(),
    returnDate: Joi.date(),
    adults: Joi.number().default(1),
    children: Joi.number(),
    infants: Joi.number(),
    travelClass: ETravelClass.validator({default: "ECONOMY"}),
    segments: [
      Joi.string(),
      Joi.array().items(Joi.string()),
    ],
  },
}, true);

module.exports.getFilterLimit = baseValidator({
  body: {},
  params: {
    searchId: Joi.string().required(),
  },
});

module.exports.filterFlights = baseValidator({
  body: {},
  params: {
    searchId: Joi.string().required(),
  },
  query: {
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
  },
});

module.exports.getFlightPrice = baseValidator({
  body: {},
  params: {
    searchId: Joi.string().required(),
    flightCode: Joi.string().required(),
  },
});

module.exports.getFlight = baseValidator({
  body: {},
  params: {
    searchId: Joi.string().required(),
    flightCode: Joi.string().required(),
  },
});

module.exports.getPopularFlights = baseValidator({
  body: {},
});

module.exports.getCountries = baseValidator({
  body: {},
});

module.exports.getCities = baseValidator({
  body: {},
  params: {
    code: Joi.string().required(),
  },
});

module.exports.getAirports = baseValidator({
  body: {},
  params: {
    countryCode: Joi.string().required(),
    cityCode: Joi.string().required(),
  },
});

module.exports.getAirlines = baseValidator({
  body: {},
}, true, true);

module.exports.restrictionCovid19 = baseValidator({
  body: {},
  params: {
    countryCode: Joi.string().required(),
    cityCode: Joi.string(),
  },
});

module.exports.searchOriginDestinationAmadeus = baseValidator({
  body: {},
  params: {
    waypointType: EFlightWaypoint.validator({required: true}),
  },
  query: {
    keyword: Joi.string(),
  },
});

module.exports.getHistoryFlights = baseValidator({
  body: {},
}, true);
