const BaseRepository = require("../core/baseRepository");
const { FlightInfo } = require("../models/documents");
const { EFlightWaypoint } = require("../constants");

class FlightInfoRepository extends BaseRepository {
  constructor() {
    super(FlightInfo);
  }

  /**
   * 
   * @param {String} fromAirportId 
   * @param {String} toAirportId 
   * @param {String} airlineId 
   * @returns {Promise<FlightInfo>}
   */
  async createFlightInfo(fromAirportId, toAirportId, airlineId) {
    let flightInfo = new FlightInfo({ fromAirportId, toAirportId, airlineId, time, price });

    await flightInfo.save();

    return flightInfo;
  }

  /**
   * @param {String} flightId
   * @param {Date} time 
   * @param {Number} price 
   * @returns {Promise<SearchedFlight>}
   */
  async searchAFlight(flightId, time, price) {
    let flightInfo = await this.findById(flightId);

    const searchedIndex = flightInfo.searches.push({ time, price });
    await flightInfo.save();

    return flightInfo.searches[searchedIndex - 1];
  }

  async cachePopularWaypoints() {

  }

  async getCachedPopularWaypoints(waypointType) {
    let result = [];
    if (EFlightWaypoint.check(["ORIGIN", "DESTINATION"], waypointType)) {

      // const codes = await redis.client.sMembers(`popular:${waypointType.toLowerCase()}`);
      // const keys = await redis.client.keys(`popular:${waypointType.toLowerCase()}:*`);

      // console.log(codes, keys)

      // list = await redis.client.sort(`popular:${waypointType.toLowerCase()} by popular:${waypointType.toLowerCase()}:*`, print);
    }

    return result;
  }

  async cachePopularFlights() {

  }

  async getCachedPopularFlights() {
    let result = [];

    return result;
  }
};


module.exports = new FlightInfoRepository();