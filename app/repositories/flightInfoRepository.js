const BaseRepository = require("../core/baseRepository");
const { FlightInfo } = require("../models/documents");

class FlightInfoRepository extends BaseRepository {
  constructor() {
    super(FlightInfo);
  }

  /**
   * 
   * @param {String} fromAirportId 
   * @param {String} toAirportId 
   * @param {String} airlineId 
   * @param {Date} time 
   * @param {Number} price 
   * @returns {Promise<FlightInfo>}
   */
  async createFlightInfo(fromAirportId, toAirportId, airlineId, time, price) {
    let flightInfo = new FlightInfo({ fromAirportId, toAirportId, airlineId, time, price });

    await flightInfo.save();

    return flightInfo;
  }
};


module.exports = new FlightInfoRepository();