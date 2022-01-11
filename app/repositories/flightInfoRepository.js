const BaseRepository = require("../core/baseRepository");
const { FlightInfo } = require("../models/documents");
const { EFlightWaypoint } = require("../constants");

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
    let flightInfo = new FlightInfo({ originCode, destinationCode, airlineCode });

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

  async getCachedPopularWaypoints(waypointType, count = 10) {
    let result = [];
    if (EFlightWaypoint.check(["ORIGIN", "DESTINATION"], waypointType)) {
      const agrFlightInfo = FlightInfo.aggregate();
      agrFlightInfo.append({ $unwind: "$searches" });
      agrFlightInfo.append({
        $group: {
          _id: "$" + waypointType.toLowerCase() + "Code",
          ct: {
            $sum: 1,
          }
        }
      });
      agrFlightInfo.append({ $sort: { ct: -1 } });
      agrFlightInfo.append({ $limit: count });
      result = await agrFlightInfo.exec();
    }

    return result;
  }

  async cachePopularFlights() {

  }

  async getCachedPopularFlights() {
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
        ct: {
          $sum: 1,
        }
      }
    });
    agrFlightInfo.append({ $sort: { ct: -1 } });
    agrFlightInfo.append({ $limit: count });
    result = await agrFlightInfo.exec();

    return result;
  }
};

module.exports = new FlightInfoRepository();