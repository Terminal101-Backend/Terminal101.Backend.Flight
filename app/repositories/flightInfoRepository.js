const BaseRepository = require("../core/baseRepository");
const { FlightInfo } = require("../models/documents");
const { EFlightWaypoint } = require("../constants");
const { generateRandomString } = require("../helpers/stringHelper");

class FlightInfoRepository extends BaseRepository {
  constructor() {
    super(FlightInfo);
  }

  /**
   * 
   * @param {String} originCode 
   * @param {String} destinationCode 
   * @param {String} airlineCode 
   * @returns {Promise<FlightInfo>}
   */
  async createFlightInfo(originCode, destinationCode, airlineCode) {
    let flightInfo = await this.findOne({ originCode, destinationCode, airlineCode });

    if (!flightInfo) {
      flightInfo = new FlightInfo({ originCode, destinationCode, airlineCode });
      await flightInfo.save();
    }

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

  async getCachedPopularWaypoints(waypointType, count = 10) {
    let result = [];
    if (EFlightWaypoint.check(["ORIGIN", "DESTINATION"], waypointType)) {
      const agrFlightInfo = FlightInfo.aggregate();
      agrFlightInfo.append({ $unwind: "$searches" });

      agrFlightInfo.append({
        $lookup: {
          from: "countries",
          let: {
            code: "$" + waypointType.toLowerCase() + "Code",
          },
          pipeline: [
            { $unwind: "$cities" },
            { $unwind: "$cities.airports" },
            {
              $match: {
                $expr: {
                  $eq: ["$cities.airports.code", "$$code"]
                }
              }
            },
          ],
          as: "waypoint",
        }
      });
      agrFlightInfo.append({ $unwind: "$waypoint" });

      agrFlightInfo.append({
        $group: {
          _id: {
            code: "$" + waypointType.toLowerCase() + "Code",
            name: "$name",
            waypoint: "$waypoint.cities.airports.name",
          },
          count: {
            $sum: 1,
          }
        }
      });
      agrFlightInfo.append({ $sort: { count: -1 } });
      agrFlightInfo.append({ $limit: count });
      agrFlightInfo.append({
        $addFields: {
          code: "$_id.code",
          count: "$count",
          name: "$_id.name",
          name: "$_id.waypoint"
        }
      });
      agrFlightInfo.append({
        $project: {
          name: 1,
          code: 1,
          count: 1,
          name: 1,
          _id: 0,
        }
      });
      result = await agrFlightInfo.exec();
    }

    return result;
  }

  async cachePopularFlights() {

  }

  async getCachedPopularFlights(count = 10) {
    let result = [];

    const agrFlightInfo = FlightInfo.aggregate();
    agrFlightInfo.append({ $unwind: "$searches" });
    agrFlightInfo.append({
      $group: {
        _id: {
          origin: "$originCode",
          destination: "$destinationCode",
          time: "$searches.time",
        },
        count: {
          $sum: 1,
        }
      }
    });
    agrFlightInfo.append({ $sort: { count: -1 } });
    agrFlightInfo.append({ $limit: count });
    agrFlightInfo.append({
      $addFields: {
        origin: "$_id.origin",
        destination: "$_id.destination",
        time: "$_id.time",
        count: "$count",
      }
    });
    agrFlightInfo.append({ $project: { origin: 1, destination: 1, time: 1, count: 1, _id: 0 } });
    result = await agrFlightInfo.exec();

    return result;
  }

  /**
   * 
   * @param {Number} length 
   * @returns {Promise<String>}
   */
  async generateUniqueCode(length = 20) {
    let code;
    while (!code) {
      code = generateRandomString(length, length, true, true, true);

      const agrFlightInfo = FlightInfo.aggregate();
      agrFlightInfo.append({ $unwind: "$searches" });
      agrFlightInfo.append({ $match: { "searches.code": code } });
      const searches = await agrFlightInfo.exec();
      if (searches.length > 0) {
        code = "";
      }
    }

    return code;
  }

  /**
   * 
   * @param {String} code 
   * @returns {Promise<FlightInfo>}
   */
  async getSearchByCode(code) {
    const agrFlightInfo = FlightInfo.aggregate();
    agrFlightInfo.append({ $unwind: "$searches" });
    agrFlightInfo.append({ $match: { "searches.code": code } });
    const searches = await agrFlightInfo.exec();

    if (searches.length > 0) {
      return searches[0];
    }
  }
};

module.exports = new FlightInfoRepository();