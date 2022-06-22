const BaseRepository = require("../core/baseRepository");
const { FlightCondition } = require("../models/documents");
const pagination = require("../helpers/paginationHelper");

/**
 * @typedef TCondition
 * @property {String[]} items
 * @property {Boolean} exclude
 */

class FlightConditionRepository extends BaseRepository {
  constructor() {
    super(FlightCondition);
  }

  /**
   * 
   * @param {TCondition} origins 
   * @param {TCondition} destinations
   * @param {TCondition} airlines
   * @param {String} providerNames
   * @param Boolean} isRestricted
   * @returns {Promise<FlightCondition>}
   */
  async createFlightCondition(origins, destinations, airlines, providerNames, isRestricted = false) {
    const flightCondition = new FlightCondition({ origins, destinations, airlines, providerNames, isRestricted });

    const lastFlightCondition = await FlightCondition.find().sort({ code: -1 }).limit(1);
    flightCondition.code = !!lastFlightCondition ? lastFlightCondition.code + 1 : 0;

    await flightCondition.save();

    return flightCondition;
  }

  /**
   * 
   * @param {Number} page 
   * @param {Number} pageSize 
   * @returns {Promise<FlightCondition[]>}
   */
  async getFlightConditions(page, pageSize) {
    const agrFlightCondition = FlightCondition.aggregate();

    const flightConditions = await pagination.rootPagination(agrFlightCondition, page, pageSize);
    return flightConditions;
  }

  /**
   * 
   * @param {Number} code 
   * @returns {Promise<FlightCondition>}
   */
  async getFlightCondition(code) {
    const flightCondition = await this.findOne({ code });

    return flightCondition;
  }
};

module.exports = new FlightConditionRepository();
