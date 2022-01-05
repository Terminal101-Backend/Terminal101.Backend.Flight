const BaseRepository = require("../core/baseRepository");
const { Country } = require("../models/documents");

/**
 * @typedef TInfo
 * @property {String} name
 * @property {String} code
 */

/**
 * @typedef TAirportInfo
 * @property {String} name
 * @property {String} code
 * @property {String} description
 * @property {TLocation} location
 */

/**
 * @typedef TLocation
 * @property {Number} latitude
 * @property {Number} longitude
 */

class CountryRepository extends BaseRepository {
  constructor() {
    super(Country);
  }

  /**
   * 
   * @param {String} name 
   * @param {String} code 
   * @returns {Promise<Country>}
   */
  async createCountry(name, code, dialingCode) {
    let country = await Country.findOne({ code });

    if (!country) {
      country = new Country({ name: "", code, dialingCode: "" });
    }

    if (country.name !== name) {
      country.name = name;
      country.dialingCode = dialingCode;
      await country.save();
    }

    return country;
  }

  /**
   * 
   * @param {String} countryCode 
   * @param {String} name 
   * @param {String} code 
   * @returns {Promise<City>}
   */
  async addCity(countryCode, name, code) {
    const agrCountry = Country.aggregate();
    agrCountry.append({ $unwind: "$cities" });
    agrCountry.append({ $match: { "cities.code": code } });
    const agrResult = await agrCountry.exec();
    if (agrResult.length > 0) {
      throw "city_code_duplicated";
    }

    const country = await Country.findOne({ code: countryCode });
    const idx = country.cities.push({ name, code });
    await country.save();

    return country.cities[idx - 1];
  }

  /**
   * 
   * @param {String} countryCode 
   * @param {String} name 
   * @param {String} code 
   * @param {String} description 
   * @param {TLocation} location 
   * @returns {Promise<TAirportInfo>}
   */
  async addAirport(countryCode, cityCode, name, code, description, location) {
    const agrCountry = Country.aggregate();
    agrCountry.append({ $unwind: "$cities" });
    agrCountry.append({ $unwind: "$cities.airports" });
    agrCountry.append({ $match: { "cities.airports.code": code } });
    const agrResult = await agrCountry.exec();
    if (agrResult.length > 0) {
      throw "airport_code_duplicated";
    }

    const country = await Country.findOne({ code: countryCode });
    const cityIndex = country.cities.findIndex(city => city.code === cityCode);
    const idx = country.cities[cityIndex].airports.push({ name, code, description, location });
    await country.save();

    return country.cities[cityIndex].airports[idx - 1];
  }

  /**
   * 
   * @param {String} countryCode 
   * @param {String} name 
   * @param {String} code 
   * @param {String} description 
   * @param {TLocation} headOfficeLocation 
   * @returns {Promise<TAirportInfo>}
   */
  async addAirline(countryCode, name, code, description, headOfficeLocation) {
    const agrCountry = Country.aggregate();
    agrCountry.append({ $unwind: "$airlines" });
    agrCountry.append({ $match: { "airlines.code": code } });
    const agrResult = await agrCountry.exec();
    if (agrResult.length > 0) {
      throw "airline_code_duplicated";
    }

    const country = await Country.findOne({ code: countryCode });
    const idx = country.airlines.push({ name, code, description, location: headOfficeLocation });
    await country.save();

    return country.airlines[idx - 1];
  }
};


module.exports = new CountryRepository();