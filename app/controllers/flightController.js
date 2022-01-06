const { EFlightWaypoint } = require("../constants");
const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const { getIpInfo } = require("../services/ip");
const { countryRepository } = require("../repositories");
const { list } = require("../constants/EUserType");

// NOTE: Flight
// NOTE: Search origin or destination
module.exports.searchOriginDestination = async (req, res) => {
  try {
    let keyword = req.query.keyword ?? "";
    if (!keyword) {
      if (EFlightWaypoint.check("ORIGIN", req.params.waypoint)) {
        const ip = request.getRequestIpAddress(req);
        const ipInfo = await getIpInfo("24.48.0.1");
        if (ipInfo.status === "success") {
          keyword = ipInfo.city;
        }
      } else {
        response.error(res, "keyword_required", 400);
        return;
      }
    }

    const result = await countryRepository.search(keyword);
    const reKeyword = new RegExp(`.*${keyword}.*`, "i");

    const foundCountries = result.filter(country => reKeyword.test(`${country.name}|${country.code}`));
    const distinctCountries = foundCountries.reduce((list, country) => ({ ...list, [country.code]: country.name }), {});
    const countriesArray = Object.entries(distinctCountries).map(country => ({ code: country[0], name: country[1] }));

    const foundCities = result.filter(country => reKeyword.test(`${country.cities.name}|${country.cities.code}`));
    const distinctCities = foundCities.reduce((list, country) => ({ ...list, [country.cities.code]: country.cities.name }), {});
    const citiesArray = Object.entries(distinctCities).map(city => ({ code: city[0], name: city[1] }));

    const foundAirports = result.filter(country => reKeyword.test(`${country.cities.airports.name}|${country.cities.airports.code}`));
    const distinctAirports = foundAirports.reduce((list, country) => ({ ...list, [country.cities.airports.code]: country.cities.airports.name }), {});
    const airportsArray = Object.entries(distinctAirports).map(airport => ({ code: airport[0], name: airport[1] }));

    response.success(res, { countries: countriesArray, cities: citiesArray, airports: airportsArray });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get countries
module.exports.getCountries = async (req, res) => {
  try {
    const countries = await countryRepository.findMany();
    response.success(res, countries.map(country => ({ code: country.code, name: country.name })));
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get cities of country
module.exports.getCities = async (req, res) => {
  try {
    const country = await countryRepository.findOne({ code: req.params.code });
    response.success(res, country.cities.map(city => ({ code: city.code, name: city.name })));
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get airports of city
module.exports.getAirports = async (req, res) => {
  try {
    const country = await countryRepository.getAirports(req.params.countryCode, req.params.cityCode);

    response.success(res, country.cities.airports.map(airport => ({ code: airport.code, name: airport.name })));
  } catch (e) {
    response.exception(res, e);
  }
};

