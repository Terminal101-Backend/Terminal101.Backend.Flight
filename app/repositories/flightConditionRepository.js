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
   * @param {TCondition} origin 
   * @param {TCondition} destination
   * @param {TCondition} airline
   * @param {String} providerNames
   * @param Boolean} isRestricted
   * @returns {Promise<FlightCondition>}
   */
  async createFlightCondition(origin, destination, airline, providerNames, isRestricted = false) {
    const flightCondition = new FlightCondition({ origin, destination, airline, providerNames, isRestricted });

    const lastFlightCondition = await FlightCondition.find().sort({ code: -1 }).limit(1);
    flightCondition.code = !!lastFlightCondition[0] ? lastFlightCondition[0].code + 1 : 0;

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
    agrFlightCondition.append({
      $lookup: {
        from: 'airports',
        localField: 'origin.items',
        foreignField: 'code',
        as: 'origin.items.info'
      }
    })

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

  /**
   * 
   * @param {String} origin 
   * @param {String} destination 
   * @returns {Promise<FlightCondition>}
   */
  async findFlightCondition(origin, destination) {
    const conditions = {
      origin: { "origin.items": origin, "origin.exclude": false, "destination.items": { $ne: destination }, "destination.exclude": true },
      destination: { "origin.items": { $ne: origin }, "origin.exclude": true, "destination.items": destination, "destination.exclude": false },
      origin_destination: { "origin.items": origin, "origin.exclude": false, "destination.items": destination, "destination.exclude": false },
      not: { "origin.items": { $ne: origin }, "origin.exclude": true, "destination.items": { $ne: destination }, "destination.exclude": true },
    };
    const condition = Object.values(conditions).reduce((condition, current) => ({ $or: [condition, current] }), {});
    const flightConditions = await this.findMany(condition);

    return flightConditions;
  }
};

module.exports = new FlightConditionRepository();
