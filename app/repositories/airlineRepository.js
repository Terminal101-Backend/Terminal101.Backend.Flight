const BaseRepository = require("../core/baseRepository");
const filterHelper = require("../helpers/filterHelper");
const paginationHelper = require("../helpers/paginationHelper");
const { Airline } = require("../models/documents");

/**
 * @typedef TInfo
 * @property {String} name
 * @property {String} code
 * @property {String} description
 * @property {TPoint} headOfficeLocation
 */

/**
 * @typedef TPoint
 * @property {Number} latitude
 * @property {Number} longitude
 */

class AirlineRepository extends BaseRepository {
  constructor() {
    super(Airline);
  }

  /**
   * 
   * @param {String} name 
   * @param {String} code 
   * @returns {Promise<Airline>}
   */
  async createAirline(name, code, description) {
    let airline = await Airline.findOne({ code });

    if (!airline) {
      airline = new Airline({ name: "", code, description: "" });
    }

    if (airline.name !== name) {
      airline.name = name;
      airline.description = description;
      await airline.save();
    }

    return airline;
  }

  /**
   * 
   * @param {String[]} airportCodes 
   * @returns {Promise<Airport>}
   */
  async getAirlinesByCode(airlineCodes) {
    const agrAirline = Airline.aggregate();
    agrAirline.append({ $match: { code: { $in: airlineCodes } } });
    const agrResult = await agrAirline.exec();

    return agrResult.reduce((airlines, airline) => {
      airlines[airline.code] = {
        code: airline.code,
        name: airline.name,
        description: airline.description,
      };

      return airlines;
    }, {});
  }

  async getAirlines(page, pageSize, filters, sort) {
    const agrAirline = Airline.aggregate();

    filterHelper.filterAndSort(agrAirline, filters, sort);
    return await paginationHelper.rootPagination(agrAirline, page, pageSize);
  }
};

module.exports = new AirlineRepository();
