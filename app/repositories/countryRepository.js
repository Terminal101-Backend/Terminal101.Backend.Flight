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
  async #getCountries(keyword, limit = 10) {
    const agrCountry = Country.aggregate();
    agrCountry.option({ allowDiskUse: true });
    agrCountry.append({
      $unwind: {
        path: "$cities",
        preserveNullAndEmptyArrays: false,
      },
    });
    agrCountry.append({
      $unwind: {
        path: "$cities.airports",
        preserveNullAndEmptyArrays: false,
      },
    });
    agrCountry.append({
      $group: {
        _id: {
          code: "$code",
          name: "$name",
          cities_code: "$cities.code",
          cities_name: "$cities.name",
        },
        city_airports: { $push: { code: "$cities.airports.code", name: "$cities.airports.name" } },
      }
    });
    agrCountry.append({
      $addFields: {
        "airports": {
          $slice: [
            "$city_airports", limit
          ]
        },
      }
    });
    agrCountry.append({
      $group: {
        _id: {
          code: "$_id.code",
          name: "$_id.name",
        },
        country_cities: { $push: { code: "$_id.cities_code", name: "$_id.cities_name", airports: "$airports" } },
      }
    });
    agrCountry.append({
      $addFields: {
        "cities": {
          $slice: [
            "$country_cities", limit
          ]
        },
      }
    });
    agrCountry.append({
      $addFields: {
        code: "$_id.code",
        name: "$_id.name",
      }
    });
    agrCountry.append({
      $match: {
        $or: [
          { name: new RegExp(`.*${keyword.toLowerCase()}.*`, "i") },
          { code: new RegExp(`.*${keyword.toLowerCase()}.*`, "i") },
        ],
      },
    });
    agrCountry.append({
      $limit: limit
    });
    agrCountry.append({
      $project: {
        _id: 0,
        code: 1,
        name: 1,
        "cities.name": 1,
        "cities.code": 1,
        "cities.airports.name": 1,
        "cities.airports.code": 1,
      }
    });

    return await agrCountry.exec();
  }

  async #getCities(keyword, limit = 10) {
    const agrCountry = Country.aggregate();
    agrCountry.option({ allowDiskUse: true });
    agrCountry.append({
      $unwind: {
        path: "$cities",
        preserveNullAndEmptyArrays: false,
      },
    });
    agrCountry.append({
      $unwind: {
        path: "$cities.airports",
        preserveNullAndEmptyArrays: false,
      },
    });
    agrCountry.append({
      $group: {
        _id: {
          code: "$cities.code",
          name: "$cities.name",
        },
        city_airports: { $push: { code: "$cities.airports.code", name: "$cities.airports.name" } },
      }
    });
    agrCountry.append({
      $addFields: {
        "airports": {
          $slice: [
            "$city_airports", limit
          ]
        },
      }
    });
    agrCountry.append({
      $addFields: {
        code: "$_id.code",
        name: "$_id.name",
      }
    });
    agrCountry.append({
      $match: {
        $or: [
          { name: new RegExp(`.*${keyword.toLowerCase()}.*`, "i") },
          { code: new RegExp(`.*${keyword.toLowerCase()}.*`, "i") },
        ],
      },
    });
    agrCountry.append({
      $limit: limit
    });
    agrCountry.append({
      $project: {
        _id: 0,
        code: 1,
        name: 1,
        "airports.name": 1,
        "airports.code": 1,
      }
    });

    return await agrCountry.exec();
  }

  async #getAirports(keyword, limit = 10) {
    const agrCountry = Country.aggregate();
    agrCountry.option({ allowDiskUse: true });
    agrCountry.append({
      $unwind: {
        path: "$cities",
        preserveNullAndEmptyArrays: false,
      },
    });
    agrCountry.append({
      $unwind: {
        path: "$cities.airports",
        preserveNullAndEmptyArrays: false,
      },
    });
    agrCountry.append({
      $group: {
        _id: {
          code: "$cities.airports.code",
          name: "$cities.airports.name",
        },
      }
    });
    agrCountry.append({
      $addFields: {
        code: "$_id.code",
        name: "$_id.name",
      }
    });
    agrCountry.append({
      $match: {
        $or: [
          { name: new RegExp(`.*${keyword.toLowerCase()}.*`, "i") },
          { code: new RegExp(`.*${keyword.toLowerCase()}.*`, "i") },
        ],
      },
    });
    agrCountry.append({
      $limit: limit
    });
    agrCountry.append({
      $project: {
        _id: 0,
        code: 1,
        name: 1,
      }
    });

    return await agrCountry.exec();
  }

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
    const idx = country.airlines.push({ name, code, description, headOfficeLocation });
    await country.save();

    return country.airlines[idx - 1];
  }

  async search(keyword, limit = 10) {
    let countries = await this.#getCountries(keyword, limit);
    let cities = await this.#getCities(keyword, limit);
    let airports = await this.#getAirports(keyword, limit);

    return { countries, cities, airports };
  }

  async getAirports(countryCode, cityCode) {
    const agrCountry = Country.aggregate();
    agrCountry.append({ $unwind: "$cities" });
    agrCountry.append({ $match: { code: countryCode } });
    agrCountry.append({ $match: { "cities.code": cityCode } });
    const agrResult = await agrCountry.exec();

    return agrResult[0];
  }

  async getAirportsByCode(airportCodes) {
    const agrCountry = Country.aggregate();
    agrCountry.append({ $unwind: "$cities" });
    agrCountry.append({ $unwind: "$cities.airports" });
    // agrCountry.append({
    //   $match: {
    //     code: {
    //       $in: Object.values(airportCodes).map(info => info.countryCode)
    //     }
    //   }
    // });
    // agrCountry.append({
    //   $match: {
    //     "cities.code": {
    //       $in: Object.values(airportCodes).map(info => info.cityCode)
    //     }
    //   }
    // });
    agrCountry.append({
      $match: {
        "cities.airports.code": {
          $in: Object.keys(airportCodes)
        }
      }
    });
    // agrCountry.append({
    //   $group: {
    //     _id: {
    //       country: {
    //         code: "$code",
    //         name: "$name",
    //       },
    //       city: {
    //         code: "$cities.code",
    //         name: "$cities.name",
    //       }
    //     },
    //     airports: {
    //       $push: {
    //         code: "$cities.airports.code",
    //         name: "$cities.airports.name",
    //         description: "$cities.airports.description",
    //       }
    //     }
    //   }
    // });
    // agrCountry.append({
    //   $group: {
    //     _id: {
    //       code: "$_id.country.code",
    //       name: "$_id.country.name",
    //     },
    //     cities: {
    //       $push: {
    //         code: "$_id.city.code",
    //         name: "$_id.city.name",
    //         airports: "$airports",
    //       },
    //     },
    //   }
    // });
    const agrResult = await agrCountry.exec();

    return agrResult.reduce((airports, country) => {
      airports[country.cities.airports.code] = {
        code: country.cities.airports.code,
        name: country.cities.airports.name,
        description: country.cities.airports.description,
      };

      return airports;
    }, {});

    //   return agrResult.reduce((countries, country) => {
    //     countries[country._id.code] = {
    //       name: country._id.name,
    //       cities: country.cities.reduce((cities, city) => {
    //         cities[city.code] = {
    //           name: city.name,
    //           // airports: city.airports,
    //           airports: city.airports.reduce((airports, airport) => {
    //             airports[airport.code] = {
    //               name: airport.name,
    //               description: airport.description,
    //             };

    //             return airports;
    //           }, {}),
    //         };

    //         return cities;
    //       }, {}),
    //     };

    //     return countries;
    //   }, {});
  }
};

module.exports = new CountryRepository();
