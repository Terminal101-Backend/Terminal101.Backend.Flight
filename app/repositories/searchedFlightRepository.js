const BaseRepository = require("../core/baseRepository");
const { SearchedFlight } = require("../models/documents");
const { EFlightWaypoint } = require("../constants")
const redis = require("../core/db/redis");
const { print } = require("redis");

class SearchedFlightRepository extends BaseRepository {
  constructor() {
    super(SearchedFlight);
  }

  /**
   * 
   * @param {String} flightId 
   * @param {Date} searchedTime 
   * @returns {Promise<SearchedFlight>}
   */
  async createSearchedFlight(flightId, searchedTime) {
    let searchedFlight = new SearchedFlight({ flightId, searchedTime });

    await searchedFlight.save();

    return searchedFlight;
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
};


module.exports = new SearchedFlightRepository();